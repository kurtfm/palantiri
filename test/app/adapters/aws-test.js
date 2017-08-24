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
var mockAws = require('mock-aws');
const mockResults = {
  ETag: '"1224efc9c15f3363df0227e1c8bebfcd"'
};

var conf = require('../../../config/load');
const app = conf.application_root + conf.api_monitor;

const target = 'onetest';

var reportData = conf.application_root + conf.test_data + target + conf
  .report_file_end;

var jsonReport = conf.application_root + conf.output_folder +
  target + conf.report_file_end;


fs.copySync(reportData, jsonReport);

mockAws.mock('S3', 'putObject', mockResults);

var aws = proxyquire(conf.application_root + '/app/adapters/aws', {
  'aws-sdk': mockAws
});


describe('AWS Adapter Tests', function() {
  var data;
  before((done) => {
    aws.s3Upload(jsonReport, target, conf.aws_s3_bucket, conf.aws_s3_file_expiration_days)
      .then((results) => {
        data = results;
        done();
      });
  });
  beforeEach(() => {
    fs.copySync(reportData, jsonReport);
  });
  it('should take a valid file do S3 putObject and return proper results', () => {
    var compared = _.differenceWith(data, mockResults, _.isEqual);
    expect(compared[0])
      .to.be
      .undefined;

  });
  after((done) => {
    fs.unlink(jsonReport, (err, data) => {
      done();
    });
  });
  it('should take a valid file do S3 putObject and delete the file', () => {
    fs.access(jsonReport, fs.F_OK, (err) => {
      var success;
      if (!err) {
        success = false;
      } else {
        success = true;
      }
      expect(success).to.be.true;
    });

  });
  it('should throw and error for an non existent file path',
    function*() {
      var bogusPath = '/bogus/path';
      return aws.s3Upload(bogusPath, target, conf.aws_s3_bucket, conf
          .aws_s3_file_expiration_days)
        .then(function(results) {

        })
        .catch((error) => {
          expect(error.message).to.equal(
            'ENOENT: no such file or directory, open \'' + bogusPath +
            '\'');
        });

    });
  it('should fail with a missing param',
    function*() {
      return aws.s3Upload(jsonReport, target, conf.aws_s3_bucket)
        .catch((error) => {
          expect(error.name).to.equal("AssertionError");
        });

    });
});
