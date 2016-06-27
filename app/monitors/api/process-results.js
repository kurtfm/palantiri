'use strict';
const JSON5 = require('json5');
const Promise = require('bluebird');
const healthcheckProcessor = require('./healthcheck-processor');
const errorProcessor = require('./error-summary-processor');
const Slack = require('../../adapters/slack');
const async = require('async');
const fs = Promise.promisifyAll(require("fs"));

var eventLog = {'healthcheck':{},'checkErrors':{},'slack':{},'cleanUp':{}};

module.exports = function(data, config){
	return new Promise(
		function(resolve,reject){
			async.waterfall([
			//healthcheck
			function(callback){
				eventLog.healthcheck.started = true;
				var report = require(data.jsonReport);

				healthcheckProcessor(report)
					.then(
						function(results){
							eventLog.healthcheck.finished = true;

							if(!config.disable_health_statu){
								fs.writeFileSync( data.outputFolder + '/healthcheck/' + data.target + '.json', JSON5.stringify(results) );
							}

							callback(null,results);
							return;
						}
					).catch(function(error){
						eventLog.healthcheck.error = error.name,":",error.message;
						console.log(error.name,":",error.message);
					});
			},
			//error processing
			function(results,callback){
				eventLog.checkErrors.started = true;
				if(results.score < 100){
					eventLog.checkErrors.hasErrors = true;
					errorProcessor(data.debugLog)
						.then(
							function(results){
								eventLog.errorCheck.finished = true;
								callback(null,results.title,results.message);
								return;
							}
						).catch(function(error){
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
			function(title,message,callback){
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
						.then(function(){
							eventLog.slack.sent = true;
							eventLog.slack.finished = true;
							callback(null);
							return null;
						}).catch(function(error){
							eventLog.slack.sent = false;
							console.log(error.name,":",error.message);
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
			/*/build merged report
			function(callback){


			},*/
			//clean up
			function(callback){
				eventLog.cleanUp.started = true;
					fs.unlinkAsync(data.jsonReport)
						.then(function(err){
					   		if (err) throw err;
				   			eventLog.jsonDeleted = true;
						}).catch(function(error){
							eventLog.cleanUp.jsonDeleted = false;
							eventLog.cleanUp.jsonDeleteError = error.name,":",error.message;
							console.log(error.name,":",error.message);
						});
					
					fs.unlinkAsync(data.debugLog)
						.then(function(err){
					   		if (err) throw err;
					   		eventLog.debugDeleted = true;
						}).catch(function(error){
							eventLog.cleanUp.debugDeleted = false;
							eventLog.cleanUp.debugDeleteError = error.name,":",error.message;
							console.log(error.name,":",error.message);
						});
					eventLog.cleanUp.finished = true;
					callback(null);
					return null;
			}
		],function(err){
			if(err){
				reject(err);
			}
			else{
				resolve(eventLog);
			}

		});
	});

};