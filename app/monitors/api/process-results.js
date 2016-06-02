'use strict';
const JSON5 = require('json5');
const Promise = require('bluebird');
const healthcheckFormatter = require('./healthcheck-processor');
const Slack = require('../../adapters/slack');
const async = require('async');
const fs = Promise.promisifyAll(require("fs"));

module.exports = function(data){
	async.waterfall([
		//healthcheck
		function(callback){
			console.log('processing healthcheck');
			var report = require(data.jsonReport);

			healthcheckFormatter(report)
				.then(
					function(results){
						fs.writeFileSync( data.outputFolder + '/healthcheck/' + data.target + '.json', JSON5.stringify(results) );
						callback(null,results);
						return;
					}
				);

		},
		//get errors 
		function(results,callback){
			console.log('checking for errors');
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
			console.log('title: ', title, ' message: ',message );
			console.log('slack notifications');
			if(!title && !message){
				console.log('got here');
				callback(null);
			}
			else{
				var slack = new Slack();
				var slackPostFile = slack.postFile(title,message, data.debugLog)
				.then(function(){
					callback(null);
					return null;
				});
			}
		},
		//clean up
		function(callback){
			console.log('cleanup files');
				fs.unlinkAsync(data.htmlSummary)
					.then(function(err){
			   			if (err) throw err;
			   			console.log(data.htmlSummary + " deleted");
					});
				fs.unlinkAsync(data.xmlSummary)
					.then(function(err){
			   			if (err) throw err;
			   			console.log(data.xmlSummary + " deleted");
					});
				fs.unlinkAsync(data.jsonReport)
					.then(function(err){
				   		if (err) throw err;
				   		console.log(data.jsonReport + " deleted");
					});
				
				fs.unlinkAsync(data.debugLog)
					.then(function(err){
				   		if (err) throw err;
				   		console.log(data.debugLog + " deleted");
					});
				callback(null);
				return null;
		}
	]);

};