'use strict';
const JSON5 = require('json5');
const Promise = require('bluebird');
const healthcheckFormatter = require('./healthcheck-processor');
const Slack = require('../../adapters/slack');
const async = require('async');
const fs = Promise.promisifyAll(require("fs"));

module.exports = function(data, config){
	return new Promise(
		function(resolve,reject){
			var eventLog = {};
			async.waterfall([
			//healthcheck
			function(callback){
				eventLog.healthcheck = 'processing health of tests';
				var report = require(data.jsonReport);

				healthcheckFormatter(report)
					.then(
						function(results){
							if(config.health_status){
								fs.writeFileSync( data.outputFolder + '/healthcheck/' + data.target + '.json', JSON5.stringify(results) );
							}
							callback(null,results);
							return;
						}
					).catch(function(error){
						console.log(error.name,":",error.message);
					});
			},
			//get errors 
			function(results,callback){
				eventLog.checkerrors = 'checking for errors';
				if(results.score < 100){
					var title = results.monitor + " just failed " + results.fails + " out of " + results.testcount + " assertions";
					var errors = "These requests had failed assertions:\n";
					var lineReader = require('readline').createInterface({
						input: require('fs').createReadStream(data.debugLog)
					});
					lineReader.on('line', function (line) {
						if(line.match(/^[0-9]+ /) && !line.match(/^200 /) ){
							errors += line + "\n";
						}
					});
					lineReader.on('close', function(){
						callback(null,title,errors);
					});
				}
				else{
					callback(null,null,null);
					return null;
				}
			},
			//slack notifications
			function(title,message,callback){
				if(config.slack_notifications){
					eventLog.slack = 'checking for slack notifications';
					if(!title && !message){
						eventLog.noerrors = 'No errors, no slack.';
						callback(null);
					}
					else{
						var slack = new Slack();
						var slackPostFile = slack.postFile(title,message, data.debugLog)
						.then(function(){
							callback(null);
							return null;
						}).catch(function(error){
							console.log(error.name,":",error.message);
						});
					}
				}
				else{
					callback(null);
				}

			},
			//clean up
			function(callback){
				eventLog.cleanup = 'cleanup files';
					fs.unlinkAsync(data.htmlSummary)
						.then(function(err){
				   			if (err) throw err;
				   			eventLogin.htmldelete = data.htmlSummary + " deleted";
						}).catch(function(error){
							console.log(error.name,":",error.message);
						});
					fs.unlinkAsync(data.xmlSummary)
						.then(function(err){
				   			if (err) throw err;
				   			eventLog.xmldelete = data.xmlSummary + " deleted";
						}).catch(function(error){
							console.log(error.name,":",error.message);
						});
					fs.unlinkAsync(data.jsonReport)
						.then(function(err){
					   		if (err) throw err;
					   		eventLog.reportdelete = data.jsonReport + " deleted";
						}).catch(function(error){
							console.log(error.name,":",error.message);
						});
					
					fs.unlinkAsync(data.debugLog)
						.then(function(err){
					   		if (err) throw err;
					   		eventLog.debugdelete = data.debugLog + " deleted";
						}).catch(function(error){
							console.log(error.name,":",error.message);
						});
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