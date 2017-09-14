
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



const conf = require('../../../../config/load');
const app = conf.application_root + conf.api_monitor;
const target = 'onetest';
conf.target = target;
const time = Date.now();
const testReportData = conf.application_root + conf.test_data +
  conf.target + '-report.json';
const outputId = time + "." + (Math.floor(Math.random() *
  (999999 - 100000 + 1)) + 100000);
const outputFolder = conf.application_root + conf.output_folder +
  target + "/" + outputId;
const jsonReport = outputFolder + conf.report_file_end;


fs.writeFileSync(jsonReport, fs.readFileSync(
  testReportData));

const processOutput = proxyquire(app + 'process-output', {
  '../adapters/aws.js': () => {
    this.s3Upload = () => {
      return new Promise((resolve, reject) => {
        resolve({
          ETag: '"1224efc9c15f3363df0227e1c8bebfcd"'
        });
      });
    };
  }
});

describe('Process Output Tests', () => {
  let data;
  before((done) => {
    processOutput(conf, target, jsonReport)
      .then((results) => {
        data = results;
        done();
      });
  });
  it('should initialize module', () => {
    expect(data.moduleInitialized).to.be.true;
  });
  it('should initialize the promise', () => {
    expect(data.promiseInitialized).to.be.true;
  });
  it('should finish the s3 upload', () => {
    expect(data.s3UploadDone).to.be.true;
  });
  it('should get data back from s3 upload', () => {
    expect(data.s3UploadData).to.not.be.empty;
  });
  it('should finish the file deletion', () => {
    expect(data.resultsDeleted).to.be.true;
  });
  it('should have really deleted the file from the file system', () => {
    let deleted;
    try {
      fs.accessSync(jsonReport, fs.F_OK);
      deleted = false;
    } catch (e) {
      deleted = true;
    }
    expect(deleted).to.be.true;
  });
  it('should fail if s3 push is disabled and I have a bogus file name',
    function*() {
      conf.aws_s3_disable_push = 1;
      const bogusPath = 'bogus';
      return processOutput(conf, target, bogusPath)
        .catch((err, log) => {
          expect(err.code).to.equal('ENOENT');
          expect(err.syscall).to.equal('unlink');
          expect(err.path).to.equal(bogusPath);
        });
    });
});
