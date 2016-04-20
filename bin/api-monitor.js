#! /usr/bin/env node
'use strict';

var config = require('../src/main/resources/config/load');

const assert = require('assert');
const app = config.application_root + config.api_monitor;
const runTests = require(app + 'test-runner');
const processResults = require(app + 'process-results');
const _ = require('lodash');

var requestedTarget = process.env.API;

assert.strictEqual(typeof requestedTarget, 
	"string", 
	"You must pass the name of the API you want to test with the process example: API=brandapis-prod node bin/api-monitor.js")
assert(_.includes(config.supported_monitors,requestedTarget), 
	"The API you pass in must be setup to run with this monitor.");

config.target = requestedTarget;

runTests(config)
	.then(
		function(data){
			processResults(data);
		}
	);