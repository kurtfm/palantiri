 
 const Datadog = require('../adapters/datadog');
 const Promise = require('bluebird');
 const yaml = require('js-yaml');
 const winston = require('winston');

 module.exports = {
     tests: (conf, target, testResults) => {
        winston.level = conf.log_level;
         const eventLog = {};
         eventLog.testsMethodInvoked = true;
         return new Promise((resolve, reject) => {
             eventLog.testsPromiseInitialized = true;
             const datadog = new Datadog(conf.metrics_prefix, conf.metrics_agent_host,
                 conf.metrics_agent_port);
             const testConfig = yaml.safeLoad(testResults.item.request.description
                 .toString());
             const tags = testConfig.tags ? testConfig.tags : [];
             const metricName = testConfig.metric_name ? testConfig.metric_name :
                 conf.metrics_default_api_name;
             const datadogCommands = [];
             const requestUrl = typeof testResults.executions[0].result.globals
                 .request
                 .uri.href !== 'undefined' ? testResults.executions[0].result.globals
                 .request.uri.href : 'NO-URL';
             const responseCode = typeof testResults.executions[0].result.globals
                 .responseCode.code !== 'undefined' ? testResults.executions[0]
                 .result.globals.responseCode.code : 'NO-RESPONSE-CODE';
             tags.push('request_url:' + requestUrl,
                 'app:' + target,
                 'response_code:' + responseCode);
             const responseTimeTags = tags.slice();
             responseTimeTags.push('response_time');
             const responseTime = testResults.executions[0].result.globals.responseTime;
             datadogCommands.push(datadog.sendHistogram(metricName,
                 responseTime, responseTimeTags));
             eventLog.collectingDatadogCommands = true;
             for (let key in testResults.executions[0].result.globals.tests) {
                 const success = testResults.executions[0].result.globals.tests[
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
         const eventLog = {};
         eventLog.totalsInitialized = true;
         return new Promise((resolve, reject) => {
             eventLog.totalsPromiseInitialized = true;
             const datadog = new Datadog(conf.metrics_prefix, conf.metrics_agent_host,
                 conf.metrics_agent_port);
             const metricName = conf.metrics_default_api_name;
             const datadogCommands = [];
             const runTotalTags = ['run_total_tests', 'app:' + target];
             const runPassesTags = ['run_passes', 'app:' + target];
             const runPendingTags = ['run_pending', 'app:' + target];
             const runFailuresTags = ['run_failures', 'app:' + target];

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
         const eventLog = {};
         eventLog.failureNoticeInitialized = true;

         return new Promise((resolve, reject) => {
             const title = target + ' ' + conf.metrics_default_api_name + ': tests failed on last run';
             const message = testTotals.assertions.failed + ' out of ' + testTotals.assertions.total + ' failed '+
                 ( conf.aws_s3_disable_push ? '' : 'See debug info in s3 bucket: ' +
                 conf.aws_s3_bucket + ' folder: ' + target + ' file:' + outputId + conf.report_file_end);
             const priority = 'normal';
             const alertType = 'error';
             const tags = [conf.metrics_prefix + conf.metrics_default_api_name,
                 'app:' + target];

             const runName = conf.metrics_prefix + '.' + conf.metrics_default_api_name;
             const datadog = new Datadog(conf.metrics_prefix, conf.metrics_agent_host,
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