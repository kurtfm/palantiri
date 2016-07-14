'use strict';

const fs = require('fs');
const JSON5 = require('json5');

module.exports = (log) => {
    return new Promise((resolve, reject) => {
        var debugLog;

        function debugRequestModel(name,
                                   id,
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
                "id": id,
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

//var log = '/Users/moeller/development/monitoring-prototype/outputs/brandapi-migration.1467068915167.876020-debug';

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
                    var nameId = info.slice(2, info.length - 2).join(' ').split('|');
                    var name = nameId[0];
                    var id = nameId[1];
                    var requestInfo = reqArray[1].split('Request data:');
                    var requestData = JSON5.parse(requestInfo[1] !== '' ? requestInfo[1] : '{}');
                    var requestHeaders = JSON5.parse(requestInfo[0].replace(/Request headers:/, ''));
                    var responseInfo = reqArray[2].split('Response body:');
                    var responseBody = JSON5.parse(responseInfo[1] !== '' ? responseInfo[1] : '{}');
                    var responseHeaders = JSON5.parse(responseInfo[0].replace(/Response headers:/, ''));

                    debugLogObjects[d] = new debugRequestModel(name,
                        id,
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



