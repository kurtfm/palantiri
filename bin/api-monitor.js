#! /usr/bin/env node
'use strict';

var config = require('../config/load');
const app = config.application_root + config.api_monitor;
const runTests = require(app + 'runner');
const processResults = require(app + 'process-results');

config.target = process.env.API;

runTests(config)
	.then(
		function(data){
			processResults(data);
		}
	);