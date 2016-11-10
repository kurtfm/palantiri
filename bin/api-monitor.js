#! /usr/bin/env node
'use strict';
var conf = require('../config/load');
const _ = require('lodash');
const app = conf.application_root + conf.api_monitor;
const runTests = require(app + 'run-controller');
//const processResults = require(app + 'handle-results');

runTests(conf)
        .then((data, err) => {
            //(data, conf);
            console.log(data);
        }
        ).catch((error) => {
    console.log(error.name, ":", error.message);
})
        .then(
                (log, err) => {
            if (err) {
                console.log("processing error: ", err);
            } else {
                if (conf.env !== 'prod') {
                    _.forEach(log, function (value, key) {
                        console.log(key, " : ", value);
                    });
                }
            }
        }).catch((error) => {
    console.log(error.name + ":" + error.message);
});
