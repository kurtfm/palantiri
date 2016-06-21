'use strict';
const fs   = require('fs');
const config = require('../../config/load');
const request = require('request');

module.exports = function(){
	this.sendMessage = function(message){
		var slackParams = config.slack_message_options;
		slackParams.text = message;
		var options = {
			method: 'POST',
			uri: config.slack_api + 'chat.postMessage',
			form: slackParams
		};
		request(options, function (error, response, body) {
			if(error){
				console.log(error);
			}
	    });
	};
	this.postFile = function(title,message,file){
		return new Promise(function(resolve,reject){
			var slackParams = config.slack_upload_options;
			slackParams.initial_comment = message;
			slackParams.file = fs.createReadStream( file );
			var filePathArr = file.split('/');
			slackParams.fileName = filePathArr[filePathArr.length-1];
			slackParams.title = title;
			slackParams.token = config.slack_token;
			var options = {
				method: 'POST',
				uri: config.slack_api + 'files.upload',
				formData: slackParams
			};
			request(options, function (error, response, body) {
				resolve({'body':body,'error':error});
		    });
		});
	};

};