#! /usr/bin/env node

'use strict';
var conf = require('../config/load');
const _ = require('lodash');
const app = conf.application_root + conf.api_monitor;
const runTests = require(app + 'run-monitor');
const winston = require('winston');
winston.level = conf.log_level;
runTests(conf)
  .then((eventLog,err) => {
    winston.log('info', 'run complete');
    if(err){
      winston.log('error',err);
    }
   
    winston.log('debug','event log from run');
    _.forOwn(eventLog, function(details, entry) {
      winston.log('debug',entry, details);
    } );

  })
  .catch((e) => {
    winston.log('error',e.name + ':' + e.message);
  });
