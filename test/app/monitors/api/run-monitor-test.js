
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


const conf = require('../../../../config/load');
const app = conf.application_root + conf.api_monitor;
conf.target = 'onetest';

const stubReportResult = {};

const runMonitor = proxyquire(app + 'run-monitor', {
  './report-results': stubReportResult,
  './process-output': (conf, target, jsonReport) => {
    return new Promise((resolve, reject) => {
      resolve({});
    });
  }
});
stubReportResult.tests = (conf, target, number) => {
  return new Promise((resolve, reject) => {
    resolve({
      'finished': true
    });
  });
};
stubReportResult.totals = (conf, target, results) => {
  return new Promise((resolve, reject) => {
    resolve({
      'finished': true
    });
  });
};
stubReportResult.failureNotice = (conf, target, stats) => {
  return new Promise((resolve, reject) => {
    resolve({
      'finished': true
    });
  });
};

describe('Run Monitor Tests', function() {
  this.timeout(5000);
  const data = {};
  before((done) => {
    const onetestFake = nock('http://localhost:33688')
      .post('/one')
      .reply(200, '');

    runMonitor(conf)
      .then((results, err) => {
        data = results;
        done();
      }).catch((error) => {
        console.log(error.name, ":", error.message);
      });


  });
  after((done) => {
    fs.unlink(data.jsonReport, (err) => {
      if (err) {
        console.log(err);
        done();
      } else {
        done();
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

/*
describe('Run Monitor Tests - Fails', function() {
    this.timeout(5000);
    const data;
    before((done) => {
        conf.target = 'onetestfail';
        const onetestFake = nock('http://localhost:33688')
            .post('/one')
            .reply(200, '');

        runMonitor(conf)
            .then((results, err) => {
                data = results;
                done();
            }).catch((error) => {
                console.log(error.name, ":", error.message);
            });


    });
    after((done) => {
        fs.unlink(data.jsonReport, (err) => {
            if (err) {
                console.log(err);
                done();
            } else {
                done();
            }
        });
    });
    it('should send failure report with a fail result', () => {
        expect(data).to.have.property(
            'sendFailureNotice')
    });
});
*/
