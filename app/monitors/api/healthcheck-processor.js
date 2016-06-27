'use strict';
const fs = require("fs");
const JSON5 = require('json5');

module.exports = function(report){
	return new Promise(function(resolve,reject){
	//summary of overall health based on pass/fail
	var passes = 0;
	var fails = 0;
	var testcount = 0;
	var error = '';
	var healthcheck = {};
	healthcheck.monitor = report.collection.name;
	healthcheck.id = report.collection.id;
	healthcheck.timestamp = report.timestamp;

	healthcheck.folders = [];

	var folders = report.collection.folders;
	var requests = report.collection.requests;
	var results = report.results;

	for (var f = 0, flen = folders.length; f < flen; f++) {
		healthcheck.folders[f] = {};
		healthcheck.folders[f].id = folders[f].id;
		healthcheck.folders[f].name = folders[f].name;
		healthcheck.folders[f].description = folders[f].description;
		healthcheck.folders[f].fails = 0;
		healthcheck.folders[f].passes = 0;
		healthcheck.folders[f].tests = [];
		var order = folders[f].order;
		for (var o = 0, olen = order.length; o < olen; o++) {
			healthcheck.folders[f].tests[o] = {};

			for (var r = 0, rlen = results.length; r < rlen; r++) {
				if(report.results[r].id ===  order[o]){
					//folder and collection stats
					var testPasses = healthcheck.folders[f].tests[o].passes = results[r].totalPassFailCounts.pass;
					var testFails = healthcheck.folders[f].tests[o].passes = results[r].totalPassFailCounts.fail;

					healthcheck.folders[f].passes += testPasses;
					healthcheck.folders[f].fails += testFails;
		  			passes += testPasses;
		  			fails += testFails;

		  			//test stats
		  			healthcheck.folders[f].tests[o].id = report.results[r].id;
				  	healthcheck.folders[f].tests[o].name = results[r].name;
				  	healthcheck.folders[f].tests[o].passes = testPasses;
				  	healthcheck.folders[f].tests[o].fails = testFails;
				  	healthcheck.folders[f].tests[o].score = (testPasses/(testPasses+testFails))*100;
				  	healthcheck.folders[f].tests[o].testPassFailCounts = results[r].testPassFailCounts;

				  	//painfully find the folder description buried in the requests
				  	for(var s = 0, slen = requests.length; s < slen; s++){
				  		if(requests[s].id === results[r].id){
				  			healthcheck.folders[f].tests[o].description = requests[s].description; 
				  		}
				  	}
				}
			}
			healthcheck.folders[f].score = (healthcheck.folders[f].passes / (healthcheck.folders[f].passes + healthcheck.folders[f].fails)) * 100;
		}
	}
	healthcheck.testcount = fails + passes;
	healthcheck.passes = passes;
	healthcheck.fails = fails;
	healthcheck.score = (healthcheck.passes / healthcheck.testcount) * 100;
    resolve(healthcheck);
	});
};