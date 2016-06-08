#! /usr/bin/env node
'use strict';
var config = require('../config/load');
const _ = require('lodash');
const app = config.application_root + config.api_monitor;
const runTests = require(app + 'runner');
const processResults = require(app + 'process-results');

runTests(config)
	.then(
		function(data,err){
			return processResults(data,config);
		}
	).catch(function(error){
		console.log(error.name,":",error.message);
	})
	.then(
		function(log,err){
			if(err){
				console.log("processing error: ",err);
			}
			else{
				if(config.env != 'prod'){
					_.forEach(log, function(value, key) {
						console.log(key," : ",value);
					});
				}
			}
	}).catch(function(error){
		console.log(error.name,":",error.message);
	});