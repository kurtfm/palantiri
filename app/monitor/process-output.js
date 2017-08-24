'use strict';
const assert = require('assert');
const JSON5 = require('json5');
const fs = require('fs');
const Promise = require('bluebird');
const aws = require('../adapters/aws.js');
const winston = require('winston');

module.exports = (conf, target, jsonReport) => {
  winston.level = conf.log_level;
  var eventLog = {};
  eventLog.moduleInitialized = true;
  return new Promise((resolve, reject) => {
    eventLog.promiseInitialized = true;
    if (conf.aws_s3_disable_push) {
      fs.unlink(jsonReport, (err, data) => {
        if (err) {
          eventLog.resultsDeleted = false;
          reject(err, eventLog);
        } else {
          eventLog.resultsDeleted = true;
          resolve(eventLog);
        }
      });
    } else {
      aws.s3Upload(jsonReport, target, conf.aws_s3_bucket,
          conf.aws_s3_file_expiration_days)
        .then((data, err) => {
          eventLog.s3UploadDone = true;
          eventLog.s3UploadData = data;
          fs.unlink(jsonReport, (err, data) => {
            if (err) {
              winston.log(err);
            } else {
              eventLog.resultsDeleted = true;
              resolve(eventLog);
            }
          });
        })
        .catch((e) => {
          winston.log('error',`${e.name} : ${e.message}`);
          reject(e);
        });
    }

  });
};
