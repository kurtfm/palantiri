'use strict';

module.exports = function(report){
	return new Promise(function(resolve,reject){
	//summary of overall health based on pass/fail
	var passes = 0;
	var fails = 0;
	var testcount = 0;
	var healthcheck = {};
	healthcheck.timestamp = report.timestamp;

	healthcheck.details = [];

	var requests = report.collection.requests;
	var results = report.results;

	for (var i = 0, len = requests.length; i < len; i++) {
		var testId = requests[i].id;
		for (var c = 0, len = results.length; c < len; c++) {
			if(report.results[c].id ==  testId){
	  			passes += results[c].totalPassFailCounts.pass;
	  			fails += results[c].totalPassFailCounts.fail;

			  	healthcheck.details[i] = {
			  		"name" : requests[i].name, 
			  		"description":requests[i].description, 
			  		"totalPassFailCounts": results[c].totalPassFailCounts, 
			  		"testPassFailCounts": results[c].testPassFailCounts
			  	}		
			}
		}
	}
	healthcheck.testcount = fails + passes;
	healthcheck.passes = passes;
	healthcheck.fails = fails;
	healthcheck.score = (healthcheck.passes / healthcheck.testcount) * 100;
   	
   	// reject(error);
    resolve(healthcheck);
	});
};