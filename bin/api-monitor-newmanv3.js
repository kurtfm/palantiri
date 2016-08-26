#! /usr/bin/env node


var newman = require('newman'); // require newman in your project
const JSON5 = require('json5');
const fs = require("fs");
const util = require('util');
const yaml = require('js-yaml');
// call newman.run to pass `options` object and wait for callback
var tests = require('../app/resources/newman/brandapi-migration-tests.json');


var runConfig = yaml.safeLoad(tests.info.description);


var uniqueUrls = {};
newman.run({
    collection: tests,
    environment: '/Users/moeller/development/monitoring-prototype/app/resources/newman/brandapi-migration-env.json',
    reporters: ['json'],
    reporter: {
        json: {export: 'out.json'}
    }
})
        .on('start', function (err, args) {
            console.info(`Running ${args.cursor.length} request(s) and ${args.cursor.cycles} iteration(s)`);
            console.log('run tags:', runConfig.tags, ' run metric: ', runConfig.metric);

        })

        .on('test', function (err, args) {
            if (err) {
                return;
            }

            console.log('---------------------------------------------------');
            var testConfig = yaml.safeLoad(args.item.request.description.toString());
            console.log('test tags: ', testConfig.tags, 'test metric: ', typeof testConfig.metric !== 'undefined' ? testConfig.metric : '');
            console.log('response time: ', args.executions[0].result.globals.responseTime);
            for (var key in args.executions[0].result.globals.tests) {
                console.log('test result: ', args.executions[0].result.globals.tests[key] ? 1 : 0);
            }
            console.log('---------------------------------------------------');

        })
        .once('done', function (err, summary) {
             console.info(`The collection run completed ${err ? 'with' : 'without'} error(s).`);
     
            console.log('---------------------------------------------------');
            console.log(summary.run.stats);
            console.log('---------------------------------------------------');
           
            console.log('debug output');
            console.log('---------------------------------------------------');

            var fullDebugData = [];
            for (var i = 0; i < summary.run.executions.length; i++) {
                var pos = summary.run.executions[i].cursor.position;
                fullDebugData[ pos ] = {
                    'id': summary.run.executions[i].id,
                    'request': summary.run.executions[i].request.toJSON(),
                    'item': summary.run.executions[i].item.toJSON(),
                    'response': summary.run.executions[i].response.toJSON(),
                    'assertions': summary.run.executions[i].assertions
                };
            }

            console.log(util.inspect(fullDebugData, {depth: 15, colors: true}));

        });