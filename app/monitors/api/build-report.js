'use strict';

const processVerboseLog = require('./process-verbose-log');
const processHealthCheck = require('./process-healthcheck');

module.exports = function(jsonReport,debugLog) {
    return new Promise(
        function (resolve, reject) {
            var report = require(jsonReport);
            var processedVerboseLog = processVerboseLog(debugLog);
            

            processedVerboseLog.then(function(debugInfo){
                report.collection.debugInfo = debugInfo;
                var processedHealthCheck = processHealthCheck(report);
                processedHealthCheck.then(function(healthSummary){
                    report.collection.healthSummary = healthSummary;
                    resolve({"report":report,"health":healthSummary});
                }).catch((error) => {
                    console.error( error.name, " : ",error.message);
                });
            });
            
        }
    );
};