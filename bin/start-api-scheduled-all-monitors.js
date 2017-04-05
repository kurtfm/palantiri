#! /usr/bin/env node
'use strict';
var conf = require('../config/load');
const spawn = require('child_process').spawn;;
const cron = require('node-cron');

var apiMonitors = conf.supported_api_monitors;

const appRoot = conf.application_root;

var apiMonitorStarter = appRoot + '/bin/start-api-monitor.js';


for (var i = 0, total = apiMonitors.length; i < total; i++) {
   
    var targetSchedule = conf.monitor_schedule[ apiMonitors[i] ];
    var monitorSchedule = typeof targetSchedule !== 'undefined' ? targetSchedule : conf.monitor_schedule.default;
    
    //mini Monitor Job class to spawn a new process and kick of run for that monitor
    var MonitorJob = function(target,schedule) {
        var args = process.argv.slice();
        args.push('--target='+target);
        args.shift();
        args.shift();
        return cron.schedule(schedule, function() {
            console.log(target + ": monitor started running with args: ", args );
            
            var monitor = spawn(apiMonitorStarter, args);
            /*
            monitor.stdout.on('data', (data) => {
                console.log(target + " verbose: " + data);
            });
            */
            monitor.on('error', (data) => {
                console.log(target + " error: " + data);
            });

            monitor.on('exit', (exitCode) => {
                console.log(target + ": monitor finished running.");
            });

        }, false);
    };

    var monitorJob = new MonitorJob(apiMonitors[i],monitorSchedule);

    //setTimeout(function(){monitorJob.start();}, i == 0 ? 1 : i * 5000);
    monitorJob.start();

}