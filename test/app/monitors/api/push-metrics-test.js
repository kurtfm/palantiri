'use strict';
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require("fs"));
const JSON5 = require('json5');
require('mocha-generators').install();
const chai = require('chai');
const expect = chai.expect; // jshint ignore:line
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var conf = require('../../../../config/load');

const app = conf.application_root + conf.api_monitor;
const pushMetrics = require(app + 'push-metrics');
const target = 'onetest';

var report= JSON5.parse(fs.readFileSync( conf.application_root + conf.test_data + target + conf.full_report_file_end, 'utf8'));

        
describe('Push Metrics Test', function () {
    var data;
    before(function (done) {
        pushMetrics(target,conf.metricsPrefix,report.collection.healthSummary).then(
                function (results, err) {
                    if (err) {
                        console.log("processing error: ", err);
                    } else {
                        data = results;
                        console.log(data);
                        done();
                    }
                }).catch(function (error) {
            console.log(error.name, ":", error.message);
        });


    });

    it('should return something', function () {
        expect(data).to.not.be.undefined;
    });
    it('should returned finished key', function () {
        expect(data).to.include.keys('finished');
    });
    it('should returned finished true', function () {
        expect(data.finished).to.be.true;
    });
});
