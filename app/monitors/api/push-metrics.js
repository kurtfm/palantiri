'use strict';
var Datadog = require('../../adapters/datadog');
const Promise = require('bluebird');

/*
 *     //metric name: <target>.<runName>.<metric> e.g. brandapis.UserMigrationAPIs.totalTests
    //tags: target, runName, requestName, folderName,metric
    
    this.sendRunTotalTests = (target,runName,total) => {
        var metric = target + '.' + runName + '.' + metricsNames.runTotalTests;
        var tags = [target,runName,metricsNames.runTotalTests];
        return new Promise((resolve, reject) => {
            client.increment(metric, total,tags,(err,bytes)=>{
                if(err){
                    reject({"error":err});
                }
                else{
                    resolve({"bytes":bytes});
                }
            });
        });
    };
    this.sendRunTotalPasses = (target,runName,passes) => {
        var metric = target + '.' + runName + '.' + metricsNames.runTotalPasses;
        var tags = [target,runName,metricsNames.runTotalPasses];
        return new Promise((resolve, reject) => {
            client.increment(metric, passes,tags,(err,bytes)=>{
                if(err){
                    reject({"error":err});
                }
                else{
                    resolve({"bytes":bytes});
                }
            });
        });
    };
    this.sendRunTotalFailures = (target,runName,fails) => {
        var metric = target + '.' + runName + '.' + metricsNames.runTotalFailures;
        var tags = [target,runName,metricsNames.runTotalFailures];
        return new Promise((resolve, reject) => {
            client.increment(metric, fails,tags,(err,bytes)=>{
                if(err){
                    reject({"error":err});
                }
                else{
                    resolve({"bytes":bytes});
                }
            });
        });
    };
    this.sendRunTotalScore = (target,runName,score) => {
        var metric = target + '.' + runName + '.' + metricsNames.runTotalScore;
        var tags = [target,runName,metricsNames.runTotalScore];
        return new Promise((resolve, reject) => {
            client.gauge(metric, score,tags,(err,bytes)=>{
                if(err){
                    reject({"error":err});
                }
                else{
                    resolve({"bytes":bytes});
                }
            });
        });
    };
    this.sendRequestResponseCode = (target,runName,requestName,folderName,code) => {
        var metric = target + '.' + runName + '.' + metricsNames.requestResponseCode + '.' + code;
        var tags = [target,runName,requestName,folderName,metricsNames.requestResponseCode];
        return new Promise((resolve, reject) => {
            client.increment(metric,1,tags,(err,bytes)=>{
                if(err){
                    reject({"error":err});
                }
                else{
                    resolve({"bytes":bytes});
                }
            });
        });
    };
    this.sendRequestResponseTime = (target,runName,requestName,folderName,time) => {
        var metric = target + '.' + runName + '.' + metricsNames.requestResponseTime;
        var tags = [target,runName,requestName,folderName,metricsNames.requestResponsTime];
        return new Promise((resolve, reject) => {
            client.histogram(metric, time,tags,(err,bytes)=>{
                if(err){
                    reject({"error":err});
                }
                else{
                    resolve({"bytes":bytes});
                }
            });
        });
    };
    this.sendRequestPasses = (target,runName,requestName,folderName,passes) => {
        var metric = target + '.' + runName + '.' + metricsNames.requestPasses;
        var tags = [target,runName,requestName,folderName,metricsNames.requestPasses];
        return new Promise((resolve, reject) => {
            client.increment(metric, passes,tags,(err,bytes)=>{
                if(err){
                    reject({"error":err});
                }
                else{
                    resolve({"bytes":bytes});
                }
            });
        });
    };
    this.sendRequestFailures = (target,runName,requestName,folderName,fails) => {
        var metric = target + '.' + runName + '.' + metricsNames.requestFailures;
        var tags = [target,runName,requestName,folderName,metricsNames.requestFailures];
        return new Promise((resolve, reject) => {
            client.increment(metric, fails,tags,(err,bytes)=>{
                if(err){
                    reject({"error":err});
                }
                else{
                    resolve({"bytes":bytes});
                }
            });
        });
    };
    var metricsNames = {};
metricsNames.runTotalTests = "runTotalTests";
metricsNames.runTotalPasses = "runTotalPasses";
metricsNames.runTotalFailures = "runTotalFailures";
metricsNames.runTotalScore = "runTotalScore";
metricsNames.requestResponseCode = "requestResponseCode";
metricsNames.requestResponseTime = "requestResponseTime";
metricsNames.requestPasses = "requestPasses";
metricsNames.requestFailures = "requestFailures";
 */

module.exports = (target,metricsPrefix,report) => {
    return new Promise((resolve, reject) => {
        var datadog = new Datadog(metricsPrefix);
        var reg = new RegExp("^.*: | ", "g");
        var name =   report.monitor.indexOf(':') !== -1 ? report.monitor.replace(reg, "") : report.monitor;
         var runTotal =  datadog.sendCount(target,report.testcount, [target,name,'runTotalTests']),
            runPasses = datadog.sendCount(target,report.passes,[target,name,'runPasses']),
            runFailures = datadog.sendCount(target,report.fails,[target,name,'runFailures']);
            
        var datadogCommands = [runTotal,runPasses,runFailures];
        for( var i = 0; i < report.folders.length; i++ ){

             var folder = report.folders[i];
             var tests = folder.tests;
             var folderName = folder.name.replace(/^.*\. | /g,'');
            for( var t = 0; t < tests.length; t++ ){
               var test = tests[t];
               var requestName = test.name.replace(/ /g,'');    
                
               var requestCode = datadog.sendCount(target,1,[target,name,requestName,folderName,'statusCode',test.statusCode]),
                   requestTime = datadog.sendHistogram(target+'.responseTime',test.responseTime,[name,requestName,folderName,'responseTime']),
                   requestPasses = datadog.sendCount(target,test.passes,[name,requestName,folderName,'requestPasses']),
                   requestFailures = datadog.sendCount(target,test.fails, [name,requestName,folderName,'requestFailures']);
               datadogCommands.push(requestCode,requestTime,requestPasses,requestFailures);
            }
        }
        Promise.all(datadogCommands)
                .then(res =>{
                    console.log('all finished: ');
                    datadog.finishedSendingMetrics().then( () => {resolve({'finished':true});} );
                }
                ).catch( error => {
                    console.log('error: ', error);
                    datadog.finishedSendingMetrics().then( () => {resolve({'finished':false});} );
                });

        
        
        
    });
};