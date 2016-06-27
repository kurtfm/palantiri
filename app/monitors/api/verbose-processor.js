'use strict';

const fs = require('fs');
const JSON5 = require('json5');

module.exports = function (log) {
    return new Promise(function (resolve, reject) {
        var debugLog;

        function debugRequestModel(name,
                                   statusCode,
                                   totalTime,
                                   method,
                                   endpoint,
                                   requestHeaders,
                                   requestData,
                                   responseHeaders,
                                   responseBody) {
            
            return {
                "name": name,
                "statusCode": statusCode,
                "totalTime": totalTime,
                "method": method,
                "endpoint": endpoint,
                "requestHeaders": requestHeaders,
                "requestData": requestData,
                "responseHeaders": responseHeaders,
                "responseBody": responseBody
            };
        };
        var debugLogObjects = [];

        var firstSep = '-------------------------------------------------------------------------------------------';

        var secondSep = '------------------------------------------------------------';

//var log = '/Users/moeller/development/monitoring-prototype/outputs/brandapi-migration.1466654804012.611156-debug';
//var log = '/Users/moeller/development/monitoring-prototype/outputs/failures-debug';
        fs.readFile(log, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            }
            debugLog = data.replace(/\n/g, "");

            var debugLogArray = debugLog.split(firstSep);
            debugLogArray.splice(0, 1);

            for (var d = 0, dlen = debugLogArray.length; d < dlen; d++) {
                var reqArray = debugLogArray[d].split(secondSep);
                for (var r = 0, rlen = reqArray.length; r < rlen; r++) {
                    var info = reqArray[0].split(' ');
                    var statusCode = info[0];
                    var totalTime = info[1];
                    var method = info[info.length - 2];
                    var endpoint = info[info.length - 1];
                    var name = info.slice(2, info.length - 2).join(' ');
                    var requestInfo = reqArray[1].split('Request data:');
                    var requestData = JSON5.parse(requestInfo[1]);
                    var requestHeaders = JSON5.parse(requestInfo[0].replace(/Request headers:/, ''));
                    var responseInfo = reqArray[2].split('Response body:');
                    var responseBody = JSON5.parse(responseInfo[1]);
                    var responseHeaders = JSON5.parse(responseInfo[0].replace(/Response headers:/, ''));

                    debugLogObjects[d] = new debugRequestModel(name,
                        statusCode,
                        totalTime,
                        method,
                        endpoint,
                        requestHeaders,
                        requestData,
                        responseHeaders,
                        responseBody);
                }
            }

            resolve(debugLogObjects);

        });

    });
};



