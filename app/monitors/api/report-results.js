 'use strict';
var Datadog = require('../../adapters/datadog');
const Promise = require('bluebird');
const yaml = require('js-yaml');


module.exports = {
        tests: (metricsPrefix,target,testResults) => {
            return new Promise((resolve, reject) => {
                 var datadog = new Datadog(metricsPrefix);
                 var testConfig = yaml.safeLoad(testResults.item.request.description.toString());
                 var tags = testConfig.tags;
                 var metricName = typeof testConfig.metric !== 'undefined' ? testConfig.metric: target;
                 var datadogCommands = [];
                 tags.push('url:'+testResults.executions[0].result.globals.request.uri.href);
                 var responseTimeTags = tags.slice()
                 responseTimeTags.push('responseTime');
                 var responseTime = testResults.executions[0].result.globals.responseTime;
                datadogCommands.push(datadog.sendHistogram(metricName,responseTime,responseTimeTags));

                for (var key in testResults.executions[0].result.globals.tests) {
                    var result = testResults.executions[0].result.globals.tests[key] ? 1 : 0;
                    datadogCommands.push(datadog.sendCount(metricName,result,tags));
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
        },
        totals: (metricsPrefix,target,testTotals) => {
            return new Promise((resolve, reject) => {
                 var datadog = new Datadog(metricsPrefix);
                 var metricName = target;
                 var datadogCommands = [];
                 var runTotalTags = ['runTotalTests'];
                 var runPassesTags = ['runPasses'];
                 var runPendingTags = ['runPending'];
                 var runFailuresTags = ['runFailures'];

                datadogCommands.push(datadog.sendCount(metricName,testTotals.assertions.total, runTotalTags),
                 datadog.sendCount(metricName,testTotals.assertions.total - testTotals.assertions.failed, runPassesTags),
                 datadog.sendCount(metricName,testTotals.assertions.pending, runPendingTags),
                 datadog.sendCount(metricName,testTotals.assertions.failed, runFailuresTags));


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
        }
};
