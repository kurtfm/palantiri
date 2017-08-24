'use strict';
require('mocha-generators').install();
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const proxyquire = require('proxyquire');
const EventEmitter = require('events');
const util = require('util');

var conf = require('../../../config/load');
const app = conf.application_root + conf.api_monitor;

function stubDatadogClientError() {
    return true;
};
stubDatadogClientError.prototype.StatsD = () => {
    var eventEmitter = new events.EventEmitter();
    this.socket = () => {
        this.once = eventEmitter.once.bind(eventEmitter);
        this.on = () => {
            eventEmitter.emit('open', this, 0);
        };
    };
};
stubDatadogClientError.prototype.increment = (metric, count, tags, cb) => {
    cb({ 'ERROR': 'error from stub' });
};
stubDatadogClientError.prototype.histogram = (metric, count, tags, cb) => {
    cb({ 'ERROR': 'error from stub' });
};
stubDatadogClientError.prototype.gauge = (metric, count, tags, cb) => {
    cb({ 'ERROR': 'error from stub' });
};
stubDatadogClientError.prototype.set = (metric, count, tags, cb) => {
    cb({ 'ERROR': 'error from stub' });
};
stubDatadogClientError.prototype.event = (metric, count, tags, cb) => {
    cb({ 'ERROR': 'error from stub' });
};
stubDatadogClientError.prototype.close = (metric, count, tags, cb) => {
    cb({ 'ERROR': 'error from stub' });
};

var Datadog = require(conf.application_root + '/app/adapters/datadog.js');
var datadog = new Datadog(conf.metrics_prefix);

describe('Datadog Adapter Tests', function() {
    it('should return some results for sendCount',
        function*() {
            return datadog.sendCount('mock', 1, ['bogus', 'tester'])
                .then(function(results) {
                    expect(results.bytes).to.be.defined;
                });
        });
    it('should throw an error for missing param when calling sendCount',
        function*() {
            return datadog.sendCount()
                .catch((error) => {
                    expect(error.name).to.equal("AssertionError");
                });
        });
    it('should return some results for sendGauge',
        function*() {
            return datadog.sendGauge('mock', 100, ['bogus', 'tester'])
                .then(function(results) {
                    expect(results.bytes).to.be.defined;
                });
        });
    it('should throw an error for missing param when calling sendGauge',
        function*() {
            return datadog.sendGauge()
                .catch((error) => {
                    expect(error.name).to.equal("AssertionError");
                });
        });
    it('should return some results for sendHistogram',
        function*() {
            return datadog.sendHistogram('mock', 100, ['bogus', 'tester'])
                .then(function(results) {
                    expect(results.bytes).to.be.defined;
                });
        });
    it('should throw an error for missing param when calling sendHistogram',
        function*() {
            return datadog.sendHistogram()
                .catch((error) => {
                    expect(error.name).to.equal("AssertionError");
                });
        });
    it('should return some results for sendSet',
        function*() {
            return datadog.sendSet('mock', 100, ['bogus', 'tester'])
                .then(function(results) {
                    expect(results.bytes).to.be.defined;
                });
        });
    it('should thrown an error for missing param when calling sendSet',
        function*() {
            return datadog.sendSet()
                .catch((error) => {
                    expect(error.name).to.equal("AssertionError");
                });
        });
    it('should send an event',
        function*() {
            return datadog.sendEvent('mock', 'mock event', 'oneTest', 'low',
                    'notice')
                .then(function(results) {
                    expect(results.response).to.be.defined;
                });
        });
    it('should throw an error for missing param when calling sendEvent',
        function*() {
            return datadog.sendEvent()
                .catch((error) => {
                    expect(error.name).to.equal("AssertionError");
                });
        });
    it('should close client socket without error',
        function*() {
            return datadog.finishedSendingMetrics()
                .then(function(results) {
                    expect(results).to.be.undefined;
                });
        });
    it('should take a different metricsagenthost',
        function*() {
            var datadog = new Datadog(conf.metrics_prefix, '127.0.0.1');
            return datadog.sendCount('mock', 1, ['bogus', 'tester'])
                .then(function(results) {
                    expect(results.bytes).to.be.defined;
                });
        });
    it('should take a different metricsagentport',
        function*() {
            var datadog = new Datadog(conf.metrics_prefix, 'localhost', '8125');
            return datadog.sendCount('mock', 1, ['bogus', 'tester'])
                .then(function(results) {
                    expect(results.bytes).to.be.defined;
                });
        });
});