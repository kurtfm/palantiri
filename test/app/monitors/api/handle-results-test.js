'use strict';

require('mocha-generators').install();
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require("fs"));
const glob = require('glob');
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var conf = require('../../../../config/load');
const app = conf.application_root + conf.api_monitor;
const processResults = require( app + 'handle-results' );
const target = 'onetest';

var time, outputId, outputBase, dataFolder, healthcheckOutputFile, testData;

var setupData = function (target) {
    time = Date.now();
    outputId = target + "." + time + "." + (Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000);
    outputBase = conf.application_root + conf.output_folder + outputId;
    dataFolder = conf.application_root + conf.test_data;
    healthcheckOutputFile = conf.application_root + conf.output_folder + "healthcheck/" + target + ".json";
    testData = {target: target,
        id: target,
        outputFolder: conf.application_root + conf.output_folder,
        jsonReport: outputBase + conf.report_file_end,
        debugLog: outputBase + conf.verbose_file_end};
};


describe('Handle Results Test', function () {
    var data;
    before(function (done) {
        setupData(target);
        var jsonFileStream = fs.createReadStream(dataFolder + target + conf.report_file_end)
                .pipe(fs.createWriteStream(outputBase + conf.report_file_end));
        var verboseFileStream = fs.createReadStream(dataFolder + target + conf.verbose_file_end)
                .pipe(fs.createWriteStream(outputBase + conf.verbose_file_end));

        jsonFileStream.on('finish', function () {
            processResults(testData, conf).then(
                    function (log, err) {
                        if (err) {
                            console.log("processing error: ", err);
                            done();
                        } else {
                            data = log;
                            done();
                        }
                    }).catch(function (error) {
                console.log(error.name, ":", error.message);
            });
        });

    });

    after(function () {
        fs.unlinkAsync(conf.application_root + conf.output_folder + "healthcheck/" + target + ".json")
                .then(function (err) {
                    if (err)
                        throw err;
                }).catch(function (error) {
            console.log(error.name, ":", error.message);
        });
        glob(conf.application_root + conf.output_folder + '*-*', function (er, files) {
            for (var i = files.length - 1; i >= 0; i--) {
                fs.unlink(files[i]);
            }
        });

    });


    it('should run tests and return something', function () {
        expect(data).to.not.be.undefined;
    });
    it('should have run healthcheck', function () {
        expect(data.healthcheck).to.not.be.undefined;
    });
    it('should have started and finished healthcheck', function () {
        expect(data.healthcheck.started).to.be.true;
        expect(data.healthcheck.finished).to.be.true;
    });
    it('should have run cleanUp', function () {
        expect(data.cleanUp).to.not.be.undefined;
    });
    it('should have started and finished cleanUp', function () {
        expect(data.cleanUp.started).to.be.true;
        expect(data.cleanUp.finished).to.be.true;
    });
    it('should have removed json report', function () {
        fs.stat(outputBase + conf.report_file_end, function (err, stats) {
            expect(err.code).to.eql('ENOENT');
        });
    });
    it('should have removed verbose debug log', function () {
        fs.stat(outputBase + conf.verbose_file_end, function (err, stats) {
            expect(err.code).to.eql('ENOENT');
        });
    });
    it('should generate a healthcheck output file', function () {
        fs.stat(healthcheckOutputFile, function (err, stats) {
            expect(stats.size).to.be.above(0);
        });
    });
    it('should output a valid report', function () {
        fs.readFile(healthcheckOutputFile, function read(err, data) {
            if (err) {
                throw err;
            }

            var report = eval('(' + data + ')');
            expect(report.monitor).to.be.eql('monitoring-agent-tests');
            expect(report.id).to.not.be.undefined;
            expect(report.timestamp).to.not.be.undefined;
            expect(typeof report.folders).to.be.eql('object');
            expect(report.folders[0]).to.not.be.undefined;
            expect(report.testcount).to.be.above(0);
            expect(report.passes).to.not.be.undefined;
            expect(report.fails).to.not.be.undefined;
            expect(report.score).to.not.be.undefined;
        });
    });
});


