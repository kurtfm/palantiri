#! /usr/bin/env node
'use strict';
var config = require('../config/load');
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const execFile = require('child_process').execFile;
const cron = require('node-cron');

var apiMonitors = config.supported_api_monitors;

const appRoot = config.application_root;

var env = process.env.NODE_ENV ? process.env.NODE_ENV : 'prod';

for (var i = 0, total = apiMonitors.length; i < total; i++) {

    var targetSchedule = config.monitor_schedule[ apiMonitors[i] ];
    var monitorSchedule = typeof targetSchedule !== 'undefined' ? targetSchedule : config.monitor_schedule.default;

    //mini Monitor Job class to spawn a new process and kick of run for that monitor
    var MonitorJob = function(target,schedule){
        return cron.schedule(schedule,function(){
            console.log(target + ": monitor started running.");
            var monitor = spawn(appRoot + '/bin/api-monitor.js', ['--environment=' + env,'--target=' + target ]);
            /*
            monitor.stdout.on('data', function (data) {
                console.log(target + " verbose: " + data);
            });
            */
            monitor.on('error', function (data) {
                console.log(target + " error: " + data);
            });

            monitor.on('exit', function (exitCode) {
                console.log(target + ": monitor finished running.");
            });

        }, false);
    };

    var monitorJob = new MonitorJob(apiMonitors[i],monitorSchedule);

    //setTimeout(function(){monitorJob.start();}, i == 0 ? 1 : i * 5000);
    monitorJob.start();

}