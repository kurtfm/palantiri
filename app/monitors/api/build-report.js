'use strict';

const processVerboseLog = require('./process-verbose-log');
const processHealthCheck = require('./process-healthcheck');

module.exports = function(jsonReport,debugLog) {
    return new Promise(
        function (resolve, reject) {
            var report = require(jsonReport);
            var processedVerboseLog = processVerboseLog(debugLog);
            var processedHealthCheck = processHealthCheck(jsonReport);

            processedVerboseLog.then(function(debugInfo){
                report.collection.debugInfo = debugInfo;
                processedHealthCheck.then(function(healthSummary){
                    report.collection.heathSummary = healthSummary;
                    resolve(report);
                });

            });
            
        }
    );
};