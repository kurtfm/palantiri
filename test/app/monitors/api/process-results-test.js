'use strict';
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
const processResults = require(app + 'process-results');
const target = 'onetest';

var time,outputId,outputBase,dataFolder,healthcheckOutputFile,testData;

var setupData = function(target){
	time = Date.now();
	outputId = target + "." + time + "." +  (Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000);
	outputBase = config.application_root + config.output_folder + outputId;
	dataFolder = config.application_root + config.test_data;
	healthcheckOutputFile = config.application_root + config.output_folder + "healthcheck/" + target + ".json";
	testData = { target: target,
	  id: target,
	  outputFolder: config.application_root + config.output_folder,
	  htmlSummary: outputBase + config.html_results_file_end,
	  xmlSummary: outputBase + config.xml_results_file_end,
	  jsonReport: outputBase + config.report_file_end,
	  debugLog:  outputBase + config.verbose_file_end};
};


describe('Result Processor Tests', function() {
	var data;
	before(function(done){
		setupData(target);
		var htmlFileStream, xmlFileStream, jsonFileStream, verboseFileStream;
		htmlFileStream = fs.createReadStream(dataFolder + target + config.html_results_file_end)
		    .pipe(fs.createWriteStream(outputBase + config.html_results_file_end));
		xmlFileStream = fs.createReadStream(dataFolder + target + config.xml_results_file_end)
		    .pipe(fs.createWriteStream(outputBase + config.xml_results_file_end));
		jsonFileStream = fs.createReadStream(dataFolder + target + config.report_file_end)
		    .pipe(fs.createWriteStream(outputBase + config.report_file_end));
		verboseFileStream = fs.createReadStream(dataFolder + target + config.verbose_file_end)
		    .pipe(fs.createWriteStream(outputBase + config.verbose_file_end));

		jsonFileStream.on('finish', function () {
			processResults(testData,config).then(
					function(log,err){
						if(err){
							console.log("processing error: ",err);
						}
						else{
							data = log;
							done();
						}
				}).catch(function(error){
					console.log(error.name,":",error.message);
				});
		});

	});

	after(function(){
		fs.unlinkAsync(config.application_root + config.output_folder + "healthcheck/" + target + ".json")
			.then(function(err){
				if (err) throw err;
			}).catch(function(error){
				console.log(error.name,":",error.message);
			});	
		
	});


	it('should run tests and return something', function() {
		expect(data).to.not.be.undefined;
	});
	it('should have run healthcheck', function() {
		expect(data.healthcheck).to.not.be.undefined;
	});
	it('should have started and finished healthcheck', function() {
		expect(data.healthcheck.started).to.be.true;
		expect(data.healthcheck.finished).to.be.true;
	});
	it('should have run checkerrors', function() {
		expect(data.checkErrors).to.not.be.undefined;
	});
	it('should have started and finished checkErrors', function() {
		expect(data.checkErrors.started).to.be.true;
		expect(data.checkErrors.finished).to.be.true;
	});
	it('should not find errors', function() {
		expect(data.checkErrors.hasErrors).to.not.be.true;
	});
	it('should have run slack', function() {
		expect(data.slack).to.not.be.undefined;
	});
	it('should have started and finished slack', function() {
		expect(data.slack.started).to.be.true;
		expect(data.slack.finished).to.be.true;
	});
	it('should run with slack enabled', function() {
		expect(data.slack.enabled).to.be.true;
	});
	it('should not be needed', function() {
		expect(data.slack.needed).to.not.be.true;
	});
	it('should have run cleanUp', function() {
		expect(data.cleanUp).to.not.be.undefined;
	});
	it('should have started and finished cleanUp', function() {
		expect(data.cleanUp.started).to.be.true;
		expect(data.cleanUp.finished).to.be.true;
	});
	it('should have removed json report',function(){
		fs.stat(outputBase + config.report_file_end, function(err,stats){
			expect(err.code).to.eql('ENOENT');
		});
	});
	it('should have removed xml results',function(){
		fs.stat(outputBase + config.xml_results_file_end, function(err,stats){
			expect(err.code).to.eql('ENOENT');
		});
	});
	it('should have removed verbose debug log',function(){
		fs.stat(outputBase + config.verbose_file_end, function(err,stats){
			expect(err.code).to.eql('ENOENT');
		});
	});
	it('should have removed html report',function(){
		fs.stat(outputBase + config.html_results_file_end, function(err,stats){
			expect(err.code).to.eql('ENOENT');
		});
	});
	it('should generate a healthcheck output file',function(){
		fs.stat(healthcheckOutputFile, function(err,stats){
			expect(stats.size).to.be.above(0);
		});
	});
	it('should output a valid report',function(){
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


