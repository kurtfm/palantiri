#! /usr/bin/env node
'use strict';
var config = require('../config/load');
const _ = require('lodash');
const app = config.application_root + config.api_monitor;
const runTests = require(app + 'run-tests');
const processResults = require(app + 'process-results');

runTests(config)
	.then((data,err) => {
			return processResults(data,config);
		}
	).catch((error) => {
		console.log(error.name,":",error.message);
	})
	.then(
		(log,err) => {
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
	}).catch( (error) => {
		console.log(error.name,":",error.message);
	});