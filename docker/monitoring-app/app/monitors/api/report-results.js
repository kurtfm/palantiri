 'use strict';
 var Datadog = require('../../adapters/datadog');
 const Promise = require('bluebird');
 const yaml = require('js-yaml');

 module.exports = {
   tests: (metricsPrefix, metricsAgentHost, metricsAgentPort, name, target,
     testResults) => {
     var log = {};
     log.testsMethodInvoked = true;
     return new Promise((resolve, reject) => {
       log.testsPromiseInitialized = true;
       var datadog = new Datadog(metricsPrefix, metricsAgentHost,
         metricsAgentPort);
       var testConfig = yaml.safeLoad(testResults.item.request.description
         .toString());
       var tags = testConfig.tags ? testConfig.tags : [];
       var metricName = testConfig.metric_name ? testConfig.metric_name :
         name;
       var datadogCommands = [];
       var requestUrl = typeof testResults.executions[0].result.globals
         .request
         .uri.href !== 'undefined' ? testResults.executions[0].result.globals
         .request.uri.href : 'NO-URL';
       var responseCode = typeof testResults.executions[0].result.globals
         .responseCode.code !== 'undefined' ? testResults.executions[0]
         .result.globals.responseCode.code : 'NO-RESPONSE-CODE';
       tags.push('request_url:' + requestUrl,
         'app:' + target,
         'response_code:' + responseCode);
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
   totals: (metricsPrefix, metricsAgentHost, metricsAgentPort, name, target,
     testTotals) => {
     var log = {};
     log.totalsInitialized = true;
     return new Promise((resolve, reject) => {
       log.totalsPromiseInitialized = true;
       var datadog = new Datadog(metricsPrefix, metricsAgentHost,
         metricsAgentPort);
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
   },
   failureNotice: (metricsPrefix, name, target, bucket, jsonReportName,
     testTotals) => {
     var log = {};
     log.failureNoticeInitialized = true;
     return new Promise((resolve, reject) => {
       var title = target + ' ' + name + ': ' + testTotals.assertions.failed +
         ' out of ' + testTotals.assertions.total +
         ' tests failed on last run';
       var message =
         'At least one test failed.  See debug info in s3 bucket: ' +
         bucket + ' folder: ' + target + ' file:' + jsonReportName;
       var priority = 'normal';
       var alertType = 'info';
       var tags = [metricsPrefix + name,
         'app:' + target
       ];

       var runName = metricsPrefix + '.' + name;
       var datadog = new Datadog(metricsPrefix, metricsAgentHost,
         metricsAgentPort);
       datadog.sendEvent(title, message, runName, priority, alertType,
         tags);
     });

   }
 };
