'use strict';
require('mocha-generators').install();
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const fs = require('fs-extra');
const _ = require('lodash');
const proxyquire = require('proxyquire');
const Promise = require('bluebird');
const nock = require('nock');


var conf = require('../../../../config/load');
const app = conf.application_root + conf.api_monitor;
conf.target = 'onetest';

var stubReportResult = {};

var runMonitor = proxyquire(app + 'run-monitor', {
  './report-results': stubReportResult,
  './process-output': (conf, target, number) => {
    return new Promise((resolve, reject) => {
      resolve({});
    });
  }
});
stubReportResult.tests = (prefix, name, target, number) => {
  return new Promise((resolve, reject) => {
    resolve({
      'finished': true
    });
  });
};
stubReportResult.totals = (prefix, name, target, results) => {
  return new Promise((resolve, reject) => {
    resolve({
      'finished': true
    });
  });
};

describe('Run Monitor Tests', () => {
  var data;
  before(function(done) {
    runMonitor(conf)
      .then((results) => {
        data = results;
        done();
      });
    var onetestFake = nock('http://localhost:33688')
      .post('/one')
      .reply(200, '');
  });
  after(() => {
    fs.unlink(data.jsonReport, (err) => {
      if (err) {
        console.log(err);
      }
    });
  });
  it('should run monitor and return log object', () => {
    expect(data).to.have.property('start');
  });
  it('should set file locations', () => {
    expect(data).to.include.keys('jsonReport',
      'testFile', 'envFile', 'globalFile');

  });
  it('should set newman options', () => {
    expect(data).to.have.property(
      'newmanOptions')
  });
  it('should have gotten to summary', () => {
    expect(data).to.have.property(
      'startSummary')
  });
  it('should have gotten to report results', () => {
    expect(data).to.have.property(
      'reportResults')
  });
});
