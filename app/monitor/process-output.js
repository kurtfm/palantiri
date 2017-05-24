'use strict';
const assert = require('assert');
const JSON5 = require('json5');
const fs = require('fs');
const Promise = require('bluebird');
const aws = require('../adapters/aws.js');

module.exports = (conf, target, jsonReport) => {
  var log = {};
  log.moduleInitialized = true;
  return new Promise((resolve, reject) => {
    log.promiseInitialized = true;
    if (conf.aws_s3_disable_push) {
      fs.unlink(jsonReport, (err, data) => {
        if (err) {
          log.resultsDeleted = false;
          reject(err, log);
        } else {
          log.resultsDeleted = true;
          resolve(log);
        }
      });
    } else {
      aws.s3Upload(jsonReport, target, conf.aws_s3_bucket,
          conf.aws_s3_file_expiration_days)
        .then((data, err) => {
          log.s3UploadDone = true;
          log.s3UploadData = data;
          fs.unlink(jsonReport, (err, data) => {
            if (err) {
              console.log(err);
            } else {
              log.resultsDeleted = true;
              resolve(log);
            }
          });
        })
        .catch((error) => {
          console.log(error.name, ":", error.message);
          reject(error);
        });
    }

  });
};
