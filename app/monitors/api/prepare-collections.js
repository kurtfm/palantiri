'use strict';

module.exports = (tests) => {
        return new Promise((resolve, reject) => {
                var processedTests = tests;
                if(processedTests.requests.length < 1){
                    reject({"error":"no requests found in tests collection"})
                }
                for (var i = 0, ilen = processedTests.requests.length; i < ilen; i++) {
                    processedTests.requests[i].name = processedTests.requests[i].name + " | " + processedTests.requests[i].id;
                }
                resolve({"tests":processedTests});

            }
        );
};