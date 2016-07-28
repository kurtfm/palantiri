'use strict';
var Datadog = require('../../adapters/datadog');
const Promise = require('bluebird');

module.exports = (target,report) => {
    return new Promise((resolve, reject) => {
        var datadog = new Datadog();
        var reg = new RegExp("^.*: | ", "g");
        var name =   report.monitor.indexOf(':') !== -1 ? report.monitor.replace(reg, "") : report.monitor;
         var runTotal =  datadog.sendRunTotalTests(target,name,report.testcount),
            runScore = datadog.sendRunTotalScore(target,name,report.score),
            runPasses = datadog.sendRunTotalPasses(target,name,report.passes),
            runFailures = datadog.sendRunTotalFailures(target,name,report.fails);
            
        var datadogCommands = [runTotal,runScore,runPasses,runFailures];
        for( var i = 0; i < report.folders.length; i++ ){

             var folder = report.folders[i];
             var tests = folder.tests;
             var folderName = folder.name.replace(/^.*\. | /g,'');
            for( var t = 0; t < tests.length; t++ ){
               var test = tests[t];
               var requestName = test.name.replace(/ /g,'');    
                
               var requestCode = datadog.sendRequestResponseCode(target,name,requestName,folderName,test.statusCode),
                   requestTime = datadog.sendRequestResponseTime(target,name,requestName,folderName,test.responseTime),
                   requestPasses = datadog.sendRequestPasses(target,name,requestName,folderName,test.passes),
                   requestFailures = datadog.sendRequestFailures(target,name,requestName,folderName,test.fails);
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