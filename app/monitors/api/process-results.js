'use strict';
const JSON5 = require('json5');
const Promise = require('bluebird');
const healthcheckProcessor = require('./process-healthcheck');
const errorProcessor = require('./process-error-summary');
const buildReport = require('./build-report');
const Slack = require('../../adapters/slack');
const async = require('async');
const fs = Promise.promisifyAll(require("fs"));

var eventLog = {'healthcheck':{},'checkErrors':{},'slack':{},'buildReport':{},'cleanUp':{}};


module.exports = (data, config) => {
	return new Promise((resolve,reject) => {
			async.waterfall([
			//healthcheck
			(callback) => {
				eventLog.healthcheck.started = true;
				healthcheckProcessor(data.jsonReport)
					.then(
						function(results){
							eventLog.healthcheck.finished = true;

							if(!config.disable_health_statu){
								fs.writeFileSync( data.outputFolder + '/healthcheck/' + data.target + '.json', JSON5.stringify(results) );
							}

							callback(null,results);
							return;
						}
					).catch((error) => {
						eventLog.healthcheck.error = error.name,":",error.message;
						console.log('process-healthcheck ',error.name,":",error.message, error);
					});
			},
			//error processing
			(results,callback) => {
				eventLog.checkErrors.started = true;
				if(results.score < 100){
					eventLog.checkErrors.hasErrors = true;
					errorProcessor(data.debugLog)
						.then((results) => {
								eventLog.errorCheck.finished = true;
								callback(null,results.title,results.message);
								return;
							}
						).catch((error) => {
						eventLog.checkErrors.error = error.name,":",error.message;
						console.log(error.name,":",error.message);
					});
				}
				else{
					eventLog.checkErrors.noErrors = true;
					eventLog.checkErrors.finished = true;
					callback(null,null,null);
					return null;
				}
			},
			//slack notifications
			(title,message,callback) => {
				eventLog.slack.started = true;
				if(!config.disable_slack_notifications){
					eventLog.slack.enabled = true;
					if(!title && !message){
						eventLog.slack.needed = false;
						eventLog.slack.finished = true;
						callback(null);
					}
					else{
						eventLog.slack.needed = true;
						var slack = new Slack();
						var slackPostFile = slack.postFile(title,message, data.debugLog)
						.then(() => {
							eventLog.slack.sent = true;
							eventLog.slack.finished = true;
							callback(null);
							return null;
						}).catch((error) => {
							eventLog.slack.sent = false;
							console.log('slack ',error.name,":",error.message);
							eventLog.slack.error = error.name,":",error.message;
							eventLog.slack.finished = true;
							callback(null);
							return null;
						});
					}
				}
				else{
					eventLog.slack.enabled = false;
					eventLog.slack.finished = true;
					callback(null);
				}

			},
			//build merged report
			(callback) => {
				eventLog.buildReport.started = true;
				buildReport(data.jsonReport,data.debugLog)
					.then((report) => {
						eventLog.buildReport.gotFullReport = true;
						fs.writeFileSync( data.outputFolder + data.target + '-full-report.json', JSON5.stringify(report) );
						callback(null);

					}).catch((error)=>{
						eventLog.buildReport = false;
						console.log('build-report ',error.name,":",error.message);
						eventLog.buildReport.error = error.name,":",error.message;
						eventLog.buildReport.finished = true;
						callback(null);
						return null;
				});
				

			},
			//clean up
			(callback) => {
				eventLog.cleanUp.started = true;
					fs.unlinkAsync(data.jsonReport)
						.then((err) => {
					   		if (err) throw err;
				   			eventLog.jsonDeleted = true;
						}).catch((error) => {
							eventLog.cleanUp.jsonDeleted = false;
							eventLog.cleanUp.jsonDeleteError = error.name,":",error.message;
							console.log(error.name,":",error.message);
						});
					
					fs.unlinkAsync(data.debugLog)
						.then((err) => {
					   		if (err) throw err;
					   		eventLog.debugDeleted = true;
						}).catch((error) => {
							eventLog.cleanUp.debugDeleted = false;
							eventLog.cleanUp.debugDeleteError = error.name,":",error.message;
							console.log(error.name,":",error.message);
						});
			   
					eventLog.cleanUp.finished = true;
					callback(null);
					return null;
			}
		],(err) => {
			if(err){
				reject(err);
			}
			else{
				resolve(eventLog);
			}

		});
	});

};