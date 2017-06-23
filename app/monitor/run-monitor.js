'use strict';
const assert = require('assert');
const JSON5 = require('json5');
const fs = require('fs');
const Promise = require('bluebird');
const newman = require('newman');
const _ = require('lodash');
const util = require('util');
const winston = require('winston');

const reportResults = require('./report-results');
const processOutput = require('./process-output');

module.exports = (conf) => {
    winston.level = conf.log_level;
    return new Promise((resolve, reject) => {
        const target = conf.target;
        const time = Date.now();
        const outputId = time + "." + (Math.floor(Math.random() *
            (999999 - 100000 + 1)) + 100000);
        const newmanFolder = conf.application_root + conf.newman_folder +
            target + '-';
        const outputFolder = conf.application_root + conf.output_folder +
            target + "/" + outputId;
        winston.log('info','start run');

        assert.strictEqual(
            typeof target,
            "string",
            "Pass API target when starting monitor example: --target=brandapi-user"
        );
        winston.log('verbose','target value is present');
        assert(
            _.includes(conf.supported_api_monitors, target),
            "The API passed in must be configured in the " + conf.env +
            " environment: " + target + " is unsupported.");
        winston.log('verbose','target value is supported');

        var jsonReport = outputFolder + conf.report_file_end;
        winston.log('verbose','jsonReport: '+jsonReport);
        var testFile = newmanFolder + conf.test_file;
        winston.log('verbose','testFile: '+ testFile);
        var envFile = newmanFolder + conf.env_file;
        winston.log('verbose','envFile: '+envFile);
        var globalFile = newmanFolder + conf.global_file;
        winston.log('verbose','globalFile: '+globalFile);

        function fileExists(path) {
            try {
                winston.log('verbose',`file ${path} exists`);
                return fs.statSync(path).isFile();
            } catch (e) {
                if (e.code === 'ENOENT') {
                    return false;
                }
                winston.log('error','Exception fs.statSync (' + path + '): ' + e);
                throw e;
            }
        }
        var tests = fileExists(testFile) ?
            require(testFile) :
            assert(false, "Could not find test file: " + testFile);
        winston.log('verbose','tests file loaded');

        var environment = fileExists(envFile) ?
            require(envFile) : {};
        winston.log('verbose','environment file loaded');
        var globals = fileExists(globalFile) ?
            require(globalFile) : {};
        winston.log('verbose','global environment file loaded');

        var newmanOptions = {
            collection: tests,
            environment: environment,
            globals: globals,
            reporters: ['json'],
            reporter: {
                json: {
                    export: jsonReport
                }
            }
        };
        winston.log('verbose','newmanOptions: ' + util.inspect(newmanOptions, {showHidden: false, depth: 2}));
        newman.run(newmanOptions)
            .on('start', function(err, args) {
                if (err) {
                    winston.log('error','error on start: ' + err);
                    reject(err);
                }
                winston.log('verbose',`Running ${args.cursor.length} request(s) and ${args.cursor.cycles} iteration(s)`);
            })
            .on('test', function(err, testInstanceResults) {
                if (err) {
                    winston.log('error','error on test: ' + err);
                    reject(err);
                }
                if (!conf.metrics_disabled) {
                    winston.log('verbose','reportResults: '+
                        `sending test metrics: ${testInstanceResults.item.name}`);
                    reportResults.tests(conf, target, testInstanceResults)
                        .then((data, err) => {
                            if (err) {
                                winston.log('error','error on reportResults: ' + err);
                            }
                            winston.log('verbose','reportResults data: ' + util.inspect(data, {showHidden: false, depth: null}));
                        });
                }
            })
            .once('done', function(err, summary) {
                if (err) {
                    winston.log('error','error on done: ' + err);
                    reject(err);
                }
                if (!conf.datadog_failure_notification_disabled && summary.run.stats.assertions.failed > 0) {
                    winston.log('verbose','sending failure notice to datadog');
                    reportResults.failureNotice(conf,target,outputId,summary.run.stats)
                        .then((data, err) => {
                            if(err){
                                winston.log('error','error on reportResults: '+ err);
                            }
                            winston.log('verbose','reportResults data: ' + util.inspect(data, {showHidden: false, depth: null}));
                        })
                        .catch((error) => {
                            winston.log('error','caught error during reportResults: '+error.name, ":", error.message);
                        });
                }
                if (!conf.metrics_disabled) {
                    winston.log('verbose','sending total metrics');
                    reportResults.totals(conf, target, summary.run.stats)
                        .then((data, err) => {
                            if (err) {
                                winston.log('error', err);
                            }
                            winston.log('verbose',data);
                            processOutput(conf, target, jsonReport);
                        })
                        .then((data, err) => {
                            if (err) {
                                winston.log('error', err);
                            }
                            winston.log('verbose',util.inspect(data, {showHidden: false, depth: null}));
                            resolve();
                        })
                        .catch((error) => {
                            winston.log('error','caught error reportResults.totals' + error.name + '-' + error.message);
                        });
                } else {
                    resolve();
                }

            });

    });

};