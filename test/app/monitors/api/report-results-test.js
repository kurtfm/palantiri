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



var conf = require('../../../../config/load');
const app = conf.application_root + conf.api_monitor;
conf.target = 'onetest';
var testResultsInstanceData = require(conf.application_root + conf.test_data +
  conf.target + '-test-results-instance');

var totalsResultsData = require(conf.application_root + conf.test_data +
  conf.target + '-totals-results');

var stubDataDog = function() {
  this.sendCount = () => {
    return new Promise((resolve, reject) => {
      resolve({
        'bytes': 1234
      });
    });
  };
  this.sendHistogram = () => {
    return new Promise((resolve, reject) => {
      resolve({
        'bytes': 1234
      });
    });
  };
  this.finishedSendingMetrics = () => {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }
};

var reportResults = proxyquire(app + 'report-results', {
  '../../adapters/datadog': stubDataDog
});


describe('Report Results Tests', () => {
  var testsData;
  var totalsData;
  before((done) => {
    reportResults.tests(conf.metrics_prefix, conf.metrics_agent_host,
        conf.metrics_agent_port, 'foo', conf.target,
        testResultsInstanceData)
      .then((results) => {
        testsData = results;
        reportResults.totals(conf.metrics_prefix, conf.metrics_agent_host,
            conf.metrics_agent_port, 'foo', conf.target,
            totalsResultsData)
          .then((results) => {
            totalsData = results;
            done();

          });
      });
  });
  it('should initialize tests method', () => {
    expect(testsData.testsMethodInvoked).to.be.true;
  });
  it('should initial promise inside of tests method', () => {
    expect(testsData.testsPromiseInitialized).to.be.true;
  });
  it('should collect all tests results datadog commands into an array', () => {
    expect(testsData.collectingDatadogCommands).to.be.true;
  });
  it('should finish calling all the datadog commands for tests', () => {
    expect(testsData.datadogCommandsDone).to.be.true;
  });
  it('should close connection with datadog agent', () => {
    expect(testsData.datadogFinishedConnection).to.be.true;
  });
  it('should initialize the totals method', () => {
    expect(totalsData.totalsInitialized).to.be.true;
  });
  it('should initialize promise inside of totals method', () => {
    expect(totalsData.totalsPromiseInitialized).to.be.true;
  });
  it('should collect all the totals results datadog commands into an array', () => {
    expect(totalsData.collectingDatadogCommands).to.be.true;
  });
  it('should finish calling all the datadog commands for totals', () => {
    expect(totalsData.datadogCommandsDone).to.be.true;
  });
  it('should close connection with datadog agent', () => {
    expect(totalsData.datadogFinishedConnection).to.be.true;
  });

  it('should fail if test instance data is missing',
    function*() {
      return reportResults.tests(conf.metrics_prefix, 'foo', conf.target)
        .catch((error) => {
          expect(error).to.be.defined;
        });
    });

});
