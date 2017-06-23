#! /usr/bin/env node

'use strict';
var conf = require('../config/load');
const _ = require('lodash');
const app = conf.application_root + conf.api_monitor;
const runTests = require(app + 'run-monitor');
const winston = require('winston');
winston.level = conf.log_level;
runTests(conf)
  .then(() => {
    winston.log('info', 'run complete');
  })
  .catch((error) => {
    winston.log('error',error.name + ':' + error.message);
  });
