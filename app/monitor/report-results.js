 'use strict';
 var Datadog = require('../adapters/datadog');
 const Promise = require('bluebird');
 const yaml = require('js-yaml');
 const winston = require('winston');

 module.exports = {
     tests: (conf, target, testResults) => {
        winston.level = conf.log_level;
         var eventLog = {};
         eventLog.testsMethodInvoked = true;
         return new Promise((resolve, reject) => {
             eventLog.testsPromiseInitialized = true;
             var datadog = new Datadog(conf.metrics_prefix, conf.metrics_agent_host,
                 conf.metrics_agent_port);
             var testConfig = yaml.safeLoad(testResults.item.request.description
                 .toString());
             var tags = testConfig.tags ? testConfig.tags : [];
             var metricName = testConfig.metric_name ? testConfig.metric_name :
                 conf.metrics_default_api_name;
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
             eventLog.collectingDatadogCommands = true;
             for (var key in testResults.executions[0].result.globals.tests) {
                 var success = testResults.executions[0].result.globals.tests[
                     key] ? 1 : 0;
                 tags.push(success ? 'result:pass' : 'result:fail');
                 datadogCommands.push(datadog.sendCount(metricName, 1,
                     tags));
             }
             Promise.all(datadogCommands)
                 .then((results) => {
                     eventLog.datadogCommandsDone = true;
                     datadog.finishedSendingMetrics().then(() => {
                         eventLog.datadogFinishedConnection = true;
                         resolve(eventLog);
                     });
                 })
                 .catch((e) => {
                     winston.log('error', e);
                     eventLog.datadogCommandsDone = false;
                     datadog.finishedSendingMetrics().then(() => {
                         resolve(eventLog);
                     });
                 });

         });
     },
     totals: (conf, target, testTotals) => {
         var eventLog = {};
         eventLog.totalsInitialized = true;
         return new Promise((resolve, reject) => {
             eventLog.totalsPromiseInitialized = true;
             var datadog = new Datadog(conf.metrics_prefix, conf.metrics_agent_host,
                 conf.metrics_agent_port);
             var metricName = conf.metrics_default_api_name;
             var datadogCommands = [];
             var runTotalTags = ['run_total_tests', 'app:' + target];
             var runPassesTags = ['run_passes', 'app:' + target];
             var runPendingTags = ['run_pending', 'app:' + target];
             var runFailuresTags = ['run_failures', 'app:' + target];

             eventLog.collectingDatadogCommands = true;
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
                     eventLog.datadogCommandsDone = true;
                     datadog.finishedSendingMetrics().then(() => {
                         eventLog.datadogFinishedConnection = true
                         resolve(eventLog);
                     });
                 })
                 .catch(e => {
                     winston.log('error', e);
                     eventLog.datadogCommandsDone = false;
                     datadog.finishedSendingMetrics().then(() => {
                         resolve(eventLog);
                     });
                 });

         });
     },
     failureNotice: (conf, target, outputId, testTotals) => {
         var eventLog = {};
         eventLog.failureNoticeInitialized = true;

         return new Promise((resolve, reject) => {
             var title = target + ' ' + conf.metrics_default_api_name + ': tests failed on last run';
             var message = testTotals.assertions.failed + ' out of ' + testTotals.assertions.total + ' failed '+
                 ( conf.aws_s3_disable_push ? '' : 'See debug info in s3 bucket: ' +
                 conf.aws_s3_bucket + ' folder: ' + target + ' file:' + outputId + conf.report_file_end);
             var priority = 'normal';
             var alertType = 'error';
             var tags = [conf.metrics_prefix + conf.metrics_default_api_name,
                 'app:' + target];

             var runName = conf.metrics_prefix + '.' + conf.metrics_default_api_name;
             var datadog = new Datadog(conf.metrics_prefix, conf.metrics_agent_host,
                 conf.metrics_agent_port);

             datadog.sendEvent(title, message, runName, priority, alertType,
                     tags)
                 .then(res => {
                     eventLog.datadogSendFailure = true;
                     resolve(eventLog);
                 })
                 .catch(e => {
                     winston.log('error', e);
                     eventLog.datadogSendFailure = false;
                     resolve(eventLog);
                 });
         });

     }
 };