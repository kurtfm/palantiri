'use strict';
const fs = require("fs");
const readline = require('readline');

module.exports = function(debugLog){
    return new Promise(function(resolve,reject){
        var title = results.monitor + " just failed " + results.fails + " out of " + results.testcount + " assertions";
        var errors = "These requests had failed assertions:\n";
        var lineReader = readline.createInterface({
            input: fs.createReadStream(debugLog)
        });
        lineReader.on('line', function (line) {
            if(line.match(/^[0-9]+ /) && !line.match(/^200 /) ){
                errors += line + "\n";
            }
        });
        lineReader.on('close', function(){
            eventLog.checkErrors.finished = true;
            resolve({"title":title,"errors":errors});
        });
    });
};