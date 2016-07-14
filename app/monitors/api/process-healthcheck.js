'use strict';

module.exports = (jsonReport) => {
    return new Promise((resolve, reject) => {
        //summary of overall health based on pass/fail
        var report = require(jsonReport),
            passes = 0,
            fails = 0,
            healthcheck = {};
        healthcheck.monitor = report.collection.name;
        healthcheck.id = report.collection.id;
        healthcheck.timestamp = report.timestamp;
        healthcheck.folders = [];
        var folders = report.collection.folders;
        var requests = report.collection.requests;
        var results = report.results;

        if('object' !== typeof folders){
            reject({error: 'Collection should be broken into folders in order for healthcheck processing and formatting to work'});
        }

        for (var f = 0; f < folders.length; f++) {
			healthcheck.folders[f] = {};
			healthcheck.folders[f].id = folders[f].id;
			healthcheck.folders[f].name = folders[f].name;
			healthcheck.folders[f].description = folders[f].description;
			healthcheck.folders[f].fails = 0;
			healthcheck.folders[f].passes = 0;
			healthcheck.folders[f].tests = [];
			var order = folders[f].order;
			for (var o = 0; o < order.length; o++) {
				healthcheck.folders[f].tests[o] = {};

				for (var r = 0; r < results.length; r++) {
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
						var nameId = results[r].name.split('|');
						healthcheck.folders[f].tests[o].name = nameId[0];
						healthcheck.folders[f].tests[o].passes = testPasses;
						healthcheck.folders[f].tests[o].fails = testFails;
						healthcheck.folders[f].tests[o].score = (testPasses/(testPasses+testFails))*100;
						healthcheck.folders[f].tests[o].testPassFailCounts = results[r].testPassFailCounts;

						//painfully find the folder description buried in the requests
						for(var s = 0; s < requests.length; s++){
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