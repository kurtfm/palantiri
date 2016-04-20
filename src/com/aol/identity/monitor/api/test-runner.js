
'use strict';
const JSON5 = require('json5');
const fs = require('fs');
const Promise = require('bluebird');
const Newman = require('newman');


module.exports = function(conf){
    const target = conf.target;
    const time = Date.now();
    const outputId = target + "." + time + "." +  (Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000);
    const newmanFolder = conf.application_root + conf.newman_folder + target + '/';
    const outputFolder = conf.application_root + conf.output_folder + outputId;
    return new Promise(function(resolve,reject){
        
        var tests = JSON5.parse(fs.readFileSync( newmanFolder + conf.test_file + "-short", 'utf8'));
        var jsonReport =  outputFolder + conf.report_file_end;
        var htmlSummary = outputFolder + conf.html_results_file_end;
        var debugLog = outputFolder +  conf.verbose_file_end;
        var xmlSummary = outputFolder +  conf.xml_results_file_end;

        var newmanOptions = {
            envJson: JSON5.parse(fs.readFileSync(newmanFolder + conf.env_file, "utf-8")),
            global: JSON5.parse(fs.readFileSync(newmanFolder + conf.global_file, "utf-8")),
            responseHandler: "TestResponseHandler",
            asLibrary: true,
            stopOnError: false,
            outputFileVerbose: debugLog,
            html: htmlSummary,
            outputFile: jsonReport,
            testReportFile: xmlSummary,
            insecure: true
        };

        Newman.execute(tests, newmanOptions,function(e){
            var testOptions = Newman.getOptions();
            if(e){
                reject(e);
            }
            else{
                resolve({
                    "target":target,
                    "id":outputId,
                    "outputFolder":conf.application_root + conf.output_folder,
                    "htmlSummary":htmlSummary,
                    "xmlSummary":xmlSummary,
                    "jsonReport":jsonReport,
                    "debugLog":debugLog}
                    );
            }
        });  
    });
  
};