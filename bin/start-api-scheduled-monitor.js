#! /usr/bin/env node
'use strict';
const conf = require('../config/load');
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const cron = require('node-cron');
const winston = require('winston');


const appRoot = conf.application_root;

const apiMonitorStarter = appRoot + '/bin/start-api-monitor.js';

const monitorSchedule = typeof conf.monitor_schedule[ conf.target ] !== 'undefined' ?
    conf.monitor_schedule[ conf.target ] : conf.monitor_schedule.default;

const MonitorJob = function(target,schedule) {
    const args = process.argv.slice(2);

    return cron.schedule(schedule, function() {
        winston.log('info', target + ': monitor started running with args: ' + args );

        const monitor = spawn(apiMonitorStarter, args);

         monitor.stdout.on('data', (data) => {
            console.log(target + ' logging: ' + data);
         });


        monitor.stderr.on('data', (data) => {
            console.log(target + ' error: ' + data);
        });


        monitor.on('close', (code) => {
            console.log(target + ': monitor finished running. - exit: ' + code);
        });

    }, false);
};

const monitorJob = new MonitorJob(conf.target,monitorSchedule);


monitorJob.start();

