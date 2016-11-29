#! /usr/bin/env node

'use strict';
var conf = require('../config/load');
const _ = require('lodash');
const app = conf.application_root + conf.api_monitor;
const runTests = require(app + 'run-monitor');


runTests(conf)
  .then((log, err) => {
    console.log('run complete!');
    if (conf.env !== 'prod') {
      console.log(log);
    }
  })
  .catch((error) => {
    console.log(error.name, ":", error.message);
  });
