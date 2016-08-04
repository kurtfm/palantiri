'use strict';
const JSON5 = require('json5');
const Promise = require('bluebird');
const healthcheckProcessor = require('./process-healthcheck');
const errorProcessor = require('./process-error-summary');
const buildReport = require('./build-report');
const pushMetrics = require('./push-metrics');
const sendNotifications = require('./send-notifications');
const Slack = require('../../adapters/slack');
const async = require('async');
const fs = Promise.promisifyAll(require("fs"));

var eventLog = {'healthcheck': {}, 'pushMetrics':{},'sendNotices':{},'checkErrors': {},  'buildReport': {}, 'cleanUp': {}};


module.exports = (data, conf) => {
    return new Promise((resolve, reject) => {
        async.waterfall([
            //build merged report
            (callback) => {
                eventLog.buildReport.started = true;
                buildReport(data.jsonReport, data.debugLog)
                        .then((response) => {
                            eventLog.buildReport.gotFullReport = true;
                            fs.writeFileSync(data.outputFolder + data.target + conf.full_report_file_end, JSON5.stringify(response.report));
                            callback(null,response.health);

                        }).catch((error) => {
                    eventLog.buildReport = false;
                    eventLog.buildReport.error = error.name +  ":" + error.message;
                    eventLog.buildReport.finished = true;
                    throw error;
                    return null;
                });
            },
            //healthcheck output
            (results,callback) => {
                eventLog.healthcheck.started = true;
                if (!conf.disable_health_status) {
                    eventLog.healthcheck.writeOutput = true;
                    fs.writeFileSync(data.outputFolder + '/healthcheck/' + data.target + '.json', JSON5.stringify(results));
                }
                eventLog.healthcheck.finished = true;
                callback(null,results);
                return;
            },
            //status processing
            (results, callback) => {
                eventLog.pushMetrics.started = true;
                if(conf.disable_metrics){
                     eventLog.pushMetrics.disabled = true;
                    callback(null,results);
                    return null;
                }
                else{
                    pushMetrics(data.target,conf.metrics_prefix,results)
                        .then(() => {
                                eventLog.pushMetrics.finished = true;
                                callback(null,results);
                                return null;
                            }
                        ).catch((error) => {
                            console.log(error);
                            eventLog.pushMetrics.error = error.name + ":" + error.message;

                        });
                }
            },
            (results,callback) => {
                eventLog.sendNotices.started = true;
                    sendNotifications(conf.metrics_prefix,conf.disable_info_notices,results)
                        .then((res) => {
                                eventLog.sendNotices.finished = true;
                                callback(null);
                                return null;
                            }
                        )
                        .catch((error) => {
                            console.log(error);
                            eventLog.sendNotices.error = error.name + ":" + error.message;
                            callback(null);
                            return null;
                        });
           
            },
            //clean up           
            (callback) => {
                eventLog.cleanUp.started = true;
                fs.unlinkAsync(data.jsonReport)
                        .then((err) => {
                            if (err){
                                throw err;
                            }
                            eventLog.jsonDeleted = true;
                        }).catch((error) => {
                    eventLog.cleanUp.jsonDeleted = false;
                    eventLog.cleanUp.jsonDeleteError = error.name + ":" + error.message;
                });

                fs.unlinkAsync(data.debugLog)
                        .then((err) => {
                            if (err)
                                throw err;
                            eventLog.debugDeleted = true;
                        }).catch((error) => {
                    eventLog.cleanUp.debugDeleted = false;
                    eventLog.cleanUp.debugDeleteError =error.name + ":" + error.message;

                });

                eventLog.cleanUp.finished = true;
                callback(null);
                return null;
            }
        ], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(eventLog);
            }

        });
    });

};