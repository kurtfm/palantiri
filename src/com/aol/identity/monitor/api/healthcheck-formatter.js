'use strict';

module.exports = function(report){
	return new Promise(function(resolve,reject){
	//summary of overall health based on pass/fail
	var passes = 0;
	var fails = 0;
	var testcount = 0;
	var healthcheck = {};
	healthcheck.monitor = report.collection.name;
	healthcheck.timestamp = report.timestamp;

	healthcheck.folders = [];

	var folders = report.collection.folders;
	var requests = report.collection.requests;
	var results = report.results;

	for (var f = 0, flen = folders.length; f < flen; f++) {
		healthcheck.folders[f] = {};
		healthcheck.folders[f].id = folders[f].id;
		healthcheck.folders[f].name = folders[f].name;
		healthcheck.folders[f].tests = [];
		var order = folders[f].order;
		for (var o = 0, olen = order.length; o < olen; o++) {
			healthcheck.folders[f].tests[o] = {};

			for (var r = 0, rlen = results.length; r < rlen; r++) {
				if(report.results[r].id ===  order[o]){
		  			passes += results[r].totalPassFailCounts.pass;
		  			fails += results[r].totalPassFailCounts.fail;

				  	healthcheck.folders[f].tests[o] = {
				  		"name": results[r].name, 
				  		"totalPassFailCounts": results[r].totalPassFailCounts, 
				  		"testPassFailCounts": results[r].testPassFailCounts
				  	};

				  	for(var s = 0, slen = requests.length; s < slen; s++){
				  		if(requests[s].id === results[r].id){
				  			healthcheck.folders[f].tests[o].description = requests[s].description;
				  			//break; 
				  		}
				  	}
				  	//break; 
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