'use strict';


var StatsD = require('hot-shots');
const Promise = require('bluebird');

var metricsNames = {};
metricsNames.runTotalTests = "runTotalTests";
metricsNames.runTotalPasses = "runTotalPasses";
metricsNames.runTotalFailures = "runTotalFailures";
metricsNames.runTotalScore = "runTotalScore";
metricsNames.requestResponseCode = "requestResponseCode";
metricsNames.requestResponseTime = "requestResponseTime";
metricsNames.requestPasses = "requestPasses";
metricsNames.requestFailures = "requestFailures";

module.exports = function () {
    
    var mock = process.env.NODE_ENV === 'test' ? true : false;
    
    var client = new StatsD('dd-agent',8125,'', '', false,false,mock);
    
    client.socket.on('error', function (error) {
        throw error;
        console.error("Error in socket for metrics: ", error);
    });
    
    //metric name: <target>.<runName>.<metric> e.g. brandapis.UserMigrationAPIs.totalTests
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
    this.sendErrorEvent = (name,type,message,runName,requestName,folderName,debugData) => {
        return new Promise((resolve, reject) => {
            
        });
     };
    this.sendEvent = (name,type,message,runName) => {
        return new Promise((resolve, reject) => {
            
        });
     };
    this.finishedSendingMetrics = () => {
        return new Promise((resolve, reject) => {
            client.close( () => {resolve();} );
        });
    };

};