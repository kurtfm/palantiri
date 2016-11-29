 'use strict';
 var Datadog = require('../../adapters/datadog');
 const Promise = require('bluebird');
 const yaml = require('js-yaml');

 module.exports = {
   tests: (metricsPrefix, name, target, testResults) => {
     var log = {};
     log.testsMethodInvoked = true;
     return new Promise((resolve, reject) => {
       log.testsPromiseInitialized = true;
       var datadog = new Datadog(metricsPrefix);
       var testConfig = yaml.safeLoad(testResults.item.request.description
         .toString());
       var tags = testConfig.tags ? testConfig.tags : [];
       var metricName = name;
       var datadogCommands = [];
       tags.push('request_url:' +
         testResults.executions[0].result.globals.request.uri.href,
         'app:' + target,
         'response_code:' +
         testResults.executions[0].result.globals.responseCode.code);
       var responseTimeTags = tags.slice();
       responseTimeTags.push('response_time');
       var responseTime = testResults.executions[0].result.globals.responseTime;
       datadogCommands.push(datadog.sendHistogram(metricName,
         responseTime, responseTimeTags));
       log.collectingDatadogCommands = true;
       for (var key in testResults.executions[0].result.globals.tests) {
         var result = testResults.executions[0].result.globals.tests[
           key] ? 1 : 0;
         datadogCommands.push(datadog.sendCount(metricName, result,
           tags));
       }
       Promise.all(datadogCommands)
         .then((results) => {
           log.datadogCommandsDone = true;
           datadog.finishedSendingMetrics().then(() => {
             log.datadogFinishedConnection = true;
             resolve(log);
           });
         })
         .catch((error) => {
           console.log('error: ', error);
           log.datadogCommandsDone = false;
           datadog.finishedSendingMetrics().then(() => {
             resolve(log);
           });
         });

     });
   },
   totals: (metricsPrefix, name, target, testTotals) => {
     var log = {};
     log.totalsInitialized = true;
     return new Promise((resolve, reject) => {
       log.totalsPromiseInitialized = true;
       var datadog = new Datadog(metricsPrefix);
       var metricName = name;
       var datadogCommands = [];
       var runTotalTags = ['run_total_tests', 'app:' + target];
       var runPassesTags = ['run_passes', 'app:' + target];
       var runPendingTags = ['run_pending', 'app:' + target];
       var runFailuresTags = ['run_failures', 'app:' + target];

       log.collectingDatadogCommands = true;
       datadogCommands.push(datadog.sendCount(metricName, testTotals.assertions
           .total, runTotalTags),
         datadog.sendCount(metricName, testTotals.assertions.total -
           testTotals.assertions.failed, runPassesTags),
         datadog.sendCount(metricName, testTotals.assertions.pending,
           runPendingTags),
         datadog.sendCount(metricName, testTotals.assertions.failed,
           runFailuresTags));

       Promise.all(datadogCommands)
         .then(res => {
           log.datadogCommandsDone = true;
           datadog.finishedSendingMetrics().then(() => {
             log.datadogFinishedConnection = true
             resolve(log);
           });
         })
         .catch(error => {
           console.log('error: ', error);
           log.datadogCommandsDone = false;
           datadog.finishedSendingMetrics().then(() => {
             resolve(log);
           });
         });

     });
   }
 };
