'use strict';
const nock = require('nock');
const glob = require('glob');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require("fs"));
require('mocha-generators').install();
const chai = require('chai');
const expect = chai.expect; // jshint ignore:line
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var config = require('../../../../config/load');
const app = config.application_root + config.api_monitor;
const runTests = require(app + 'start-run');

describe('Start Run Tests', function () {
    var data;
    before(function (done) {
        config.target = 'onetest';
        runTests(config)
                .then(function (results) {
                    data = results;
                    done();
                });

        var onetestFake = nock('http://localhost:33688')
                .post('/one')
                .reply(200, '');
    });

    after(function () {

        fs.unlinkAsync(data.jsonReport)
                .then(function (err) {
                    if (err)
                        throw err;
                }).catch(function (error) {
            console.log(error.name, ":", error.message);
        });

        fs.unlinkAsync(data.debugLog)
                .then(function (err) {
                    if (err)
                        throw err;
                }).catch(function (error) {
            console.log(error.name, ":", error.message);
        });
    });

    it('should run tests and return something', function () {
        expect(data).to.not.be.undefined;
    });
    it('should run tests and return data with target that matches the one passed in', function* () {
        expect(data.target).to.equal(config.target);
    });
    it('should run tests and return id', function* () {
        expect(data.id).to.not.be.undefined;
    });
    it('should run tests and return outputFolder', function* () {
        expect(data.outputFolder).to.not.be.undefined;
    });
    it('should run tests and return jsonReport', function* () {
        expect(data.jsonReport).to.not.be.undefined;
    });
    it('should run tests and return debugLog', function* () {
        expect(data.debugLog).to.not.be.undefined;
    });

    it('should take an invalid target and throw and exception', function () {
        config.target = 'bogus';
        return runTests(config).catch(
                function (error) {
                    expect(error.name).to.equal("AssertionError");
                    expect(error.message).to.equal("The API passed in must be configured in the " + config.env + " environment: "
                            + config.target + " is unsupported.");
                });

    });
    it('should fail with missing test file', function* () {
        config.target = 'badtest';
        return runTests(config).catch(
                function (error) {
                    expect(error.name).to.equal("AssertionError");
                    expect(error.message).to.contain("Could not find test file");
                });

    });

});