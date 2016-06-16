'use strict';
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require("fs"));
require('mocha-generators').install();
const chai = require('chai');
const expect = chai.expect; // jshint ignore:line
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const _ = require('lodash');

var config = require('../../../../config/load');

console.log(config.env);

const app = config.application_root + config.api_monitor;
const healthcheckProcessor = require(app + 'healthcheck-processor');
const target = 'onetest';

var reportData = require(config.application_root + config.test_data + target + config.report_file_end);

describe('Healthcheck Processor Tests', function() {
	var data;
	before(function(done){

			healthcheckProcessor(reportData).then(
					function(results,err){
						if(err){
							console.log("processing error: ",err);
						}
						else{
							data = results;
							done();
						}
				}).catch(function(error){
					console.log(error.name,":",error.message);
				});


	});

	it('should return something', function() {
		expect(data).to.not.be.undefined;
	});
	it('should return an object', function() {
		expect(_.isPlainObject(data)).to.be.true;
	});
	it('should return the right monitor name', function() {
		expect(data.monitor).to.be.eql('monitoring-agent-tests');
	});
	it('should return an id', function() {
		expect(data.id).to.not.be.undefined;
	});
	it('should return a timestamp', function() {
		expect(data.timestamp).to.not.be.undefined;
	});
	it('should return a folder array', function() {
		expect(_.isArray(data.folders)).to.be.true;
	});
	it('should return a test count above 0',function(){
		expect(data.testcount).to.be.above(0);
	});
	it('should return passes count',function(){
		expect(data.passes).to.not.be.undefined;

	});
	it('should return fails count',function(){
		expect(data.fails).to.not.be.undefined;

	});
	it('should return a score calculation',function(){
		expect(data.score).to.not.be.undefined;
	});
});


