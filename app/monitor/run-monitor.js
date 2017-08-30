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
  return new Promise((resolve, reject) => {
    winston.level = conf.log_level;
    const target = conf.target;
    const time = Date.now();
    const outputId = time + "." + (Math.floor(Math.random() *
      (999999 - 100000 + 1)) + 100000);
    const newmanFolder = conf.application_root + conf.newman_folder +
      target + '-';
    const outputFolder = conf.application_root + conf.output_folder +
      target + "/" + outputId;

    const eventLog = {};

    eventLog.start = 'assert target value is present';
    assert.strictEqual(
      typeof target,
      "string",
      "Pass API target when starting monitor example: --target=monitor-app-demo"
    );
    assert(
      _.includes(conf.supported_api_monitors, target),
      "The API passed in must be configured in the " + conf.env +
      " environment: " + target + " is unsupported.");

    const jsonReport = outputFolder + conf.report_file_end;
    eventLog.jsonReport = jsonReport;
    const testFile = newmanFolder + conf.test_file;
    eventLog.testFile = testFile;
    const envFile = newmanFolder + conf.env_file;
    eventLog.envFile = envFile;
    const globalFile = newmanFolder + conf.global_file;
    eventLog.globalFile = globalFile;

    function fileExists(path) {
      try {
        eventLog.fileExists = `file ${path} exists`;
        return fs.statSync(path).isFile();
      } catch (e) {
        if (e.code === 'ENOENT') {
          return false;
        }
        winston.log('error',`fs.statSync ( ${path} ): ${e}`);
        throw e;
      }
    }
    const tests = fileExists(testFile) ?
      require(testFile) :
      assert(false, `Could not find test file: ${testFile}`);

    const environment = fileExists(envFile) ?
      require(envFile) : {};
    const globals = fileExists(globalFile) ?
      require(globalFile) : {};

    const newmanOptions = {
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
    eventLog.newmanOptions = newmanOptions;
    newman.run(newmanOptions)
      .on('start', function(err, args) {
        if (err) {
          winston.log('error',err);
          reject(err, eventLog);
        }
        eventLog.startSummary =
          `Running ${args.cursor.length} request(s) and ${args.cursor.cycles} iteration(s)`;
      })
      .on('test', function(err, testInstanceResults) {
        if (err) {
          winston.log('error',err);
          reject(err, log);
        }
        if (!conf.metrics_disabled) {
          eventLog.reportResults =
            `sending test metrics: ${testInstanceResults.item.name}`;
          reportResults.tests(conf, target, testInstanceResults)
            .then((data, err) => {
              if (err) {
                winston.log('error', err);
              }
              eventLog.reportResults = data;
            });
        }
      })
      .once('done', function(err, summary) {
        if (err) {
          winston.log('error',err);
          reject(err, log);
        }
        if (!conf.datadog_failure_notification_disabled && summary.run.stats
          .assertions.failed > 0) {
          eventLog.sendFailureNotice = 'sending failure notice to datadog';
          reportResults.failureNotice(conf, target, outputId, summary.run
              .stats)
            .then((data, err) => {
              eventLog.sendFailureNoticeResults = data;
            })
            .catch((e) => {
              winston.log('error',e.name, ":", e.message);
            });
        }
        if (!conf.metrics_disabled) {
          eventLog.reportResults = 'sending total metrics';
          reportResults.totals(conf, target, summary.run.stats)
            .then((data, err) => {
              if (err) {
                winston.log('error', err);
              }
              eventLog.reportResults = data;
              processOutput(conf, target, jsonReport);
            })
            .then((data, err) => {
              resolve(eventLog, err);
            })
            .catch((e) => {
              winston.log('error',`${e.name} : ${e.message}`);
            });
        } else {
          resolve(eventLog);
        }

      });

  });

};
