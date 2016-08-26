
'use strict';
const assert = require('assert');
const JSON5 = require('json5');
const fs = require('fs');
const Promise = require('bluebird');
const Newman = require('newman');
const _ = require('lodash');
const configureTests = require('./prepare-collections');

module.exports = (conf) => {
    return new Promise((resolve,reject) => {
        const target = conf.target;
        const time = Date.now();
        const outputId = target + "." + time + "." +  (Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000);
        const newmanFolder = conf.application_root + conf.newman_folder + target + '-';
        const outputFolder = conf.application_root + conf.output_folder + outputId;

        assert.strictEqual(
            typeof target,
            "string",
            "Pass API target when starting monitor example: --target=brandapi-user");
        assert(
            _.includes(conf.supported_api_monitors,target),
            "The API passed in must be configured in the " + conf.env + " environment: "+target+ " is unsupported.");


        var jsonReport =  outputFolder + conf.report_file_end;
        var debugLog = outputFolder +  conf.verbose_file_end;
        var testFile = newmanFolder + conf.test_file;
        var envFile = newmanFolder + conf.env_file;
        var globalFile = newmanFolder + conf.global_file;

        function fileExists(path) {
          try  {
            return fs.statSync(path).isFile();
          }
          catch (e) {
            if (e.code === 'ENOENT') { 
              return false;
            }
            console.log("Exception fs.statSync (" + path + "): " + e);
            throw e;
          }
        }

        var tests = fileExists(testFile) ?
            testFile: 
            assert(false, "Could not find test file: " + testFile);

        var environment = fileExists(envFile) ?
            envFile : {};
        var globals = fileExists(globalFile) ?
            globalFile : {};
       
        var newmanOptions = {
            collection: tests,
            environment: environment,
            global: globals,
            stopOnError: false,
            reporters:['cli']
        };
        Newman.run(newmanOptions).on('done',(err,summary) => {
            if(err){
                console.log(err);
                reject(err);
            }
            else{
                resolve({
                    "target":target,
                    "summary":summary}
                );
            }
        });



    });
  
};