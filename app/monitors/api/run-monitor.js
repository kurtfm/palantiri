'use strict';
const assert = require('assert');
const JSON5 = require('json5');
const fs = require('fs');
const Promise = require('bluebird');
const newman = require('newman');
const _ = require('lodash');
const util = require('util');

const reportResults = require('./report-results');
const processOutput = require('./process-output');

module.exports = (conf) => {
  return new Promise((resolve, reject) => {
    const target = conf.target;
    const time = Date.now();
    const outputId = time + "." + (Math.floor(Math.random() *
      (999999 - 100000 + 1)) + 100000);
    const newmanFolder = conf.application_root + conf.newman_folder +
      target + '-';
    const outputFolder = conf.application_root + conf.output_folder +
      target + "/" + outputId;

    var log = {};

    log.start = 'assert target value is present';
    assert.strictEqual(
      typeof target,
      "string",
      "Pass API target when starting monitor example: --target=brandapi-user"
    );
    assert(
      _.includes(conf.supported_api_monitors, target),
      "The API passed in must be configured in the " + conf.env +
      " environment: " + target + " is unsupported.");


    var jsonReport = outputFolder + conf.report_file_end;
    log.jsonReport = jsonReport;
    var testFile = newmanFolder + conf.test_file;
    log.testFile = testFile;
    var envFile = newmanFolder + conf.env_file;
    log.envFile = envFile;
    var globalFile = newmanFolder + conf.global_file;
    log.globalFile = globalFile;

    function fileExists(path) {
      try {
        log.fileExists = `file ${path} exists`
        return fs.statSync(path).isFile();
      } catch (e) {
        if (e.code === 'ENOENT') {
          return false;
        }
        console.log("Exception fs.statSync (" + path + "): " + e);
        throw e;
      }
    }

    var tests = fileExists(testFile) ?
      require(testFile) :
      assert(false, "Could not find test file: " + testFile);

    var environment = fileExists(envFile) ?
      require(envFile) : {};
    var globals = fileExists(globalFile) ?
      require(globalFile) : {};

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
    log.newmanOptions = newmanOptions;

    newman.run(newmanOptions)
      .on('start', function(err, args) {
        if (err) {
          console.log(err);
          reject(err, log);
        }
        log.startSummary =
          `Running ${args.cursor.length} request(s) and ${args.cursor.cycles} iteration(s)`;

      })
      .on('test', function(err, testInstanceResults) {
        if (err) {
          reject(err, log);
        }
        //console.log(util.inspect(testInstanceResults, {depth: 15, colors: true}));
        log.reportResults =
          `sending test metrics: ${testInstanceResults.item.name}`;
        reportResults.tests(conf.metrics_prefix, conf.metrics_default_name,
            target, testInstanceResults)
          .then((data, err) => {
            if (err) {
              console.log('error: ', err);
            }
            log.reportResults = data;
          })

      })
      .once('done', function(err, summary) {
        if (err) {
          reject(err, log);
        }
        log.reportResults = `sending total metrics`;
        reportResults.totals(conf.metrics_prefix, conf.metrics_default_name,
            target, summary.run.stats)
          .then((data, err) => {
            if (err) {
              console.log('error: ', err);
            }
            log.reportResults = data;
            processOutput(conf, target, jsonReport)
          })
          .then((data, err) => {
            resolve(log, err);
          })
          .catch((error) => {
            console.log(error.name, ":", error.message);
          });

      })

  });

};
