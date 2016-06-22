#! /usr/bin/env node
'use strict';
var config = require('../config/load');
const spawn = require('child_process').spawn;
const CronJob = require('cron').CronJob;

var apiMonitors = config.supported_api_monitors;

const appRoot = config.application_root;

var env = process.env.NODE_ENV ? process.env.NODE_ENV : 'prod';

for (var i = 0, total = apiMonitors.length; i < total; i++) {
    //add a setTimeout here to get the monitors staggering more

    var targetSchedule = config.monitor_schedule[ apiMonitors[i] ];
    var monitorSchedule = typeof targetSchedule !== 'undefined' ? targetSchedule : config.monitor_schedule.default;

    var monitorJob = function(){
        var monitor = spawn(appRoot + '/bin/api-monitor.js', ['--environment=' + env,'--target=' + apiMonitors[i] ]);
        monitor.on('error', function (data) {
            console.log(data);
        });

        monitor.on('exit', function (exitCode) {
            console.log("Monitor finished running.");
        });
    };

    new CronJob(monitorSchedule, monitorJob(), null, true);
    
}