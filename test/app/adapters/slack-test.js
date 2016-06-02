const nock = require('nock');
require('mocha-generators').install();
const chai = require('chai');
const expect = chai.expect; // jshint ignore:line
const should = chai.should();
const JSON5 = require('json5');
const fs = require('fs');

var config = require('../../../config/load');
const Slack = require(config.application_root + '/app/adapters/slack');

var slack = new Slack();
var debug = config.application_root + config.test_data + 'onetest-debug';
var slackResponseBody = JSON5.parse(fs.readFileSync(config.application_root + config.test_data + 'slack-response.json', 'utf-8'));
var title = slackResponseBody.file.title;
var message = slackResponseBody.file.initial_comment.comment;

describe('Slack Tests', function() {
	beforeEach(function(){
	var slackResponse = nock('https://slack.com')
	            .post('/api/files.upload')
	            .reply(200, slackResponseBody);
	});
	it('should take title,message and file path and return results', function*() {
	return slack.postFile(title,message, debug)
		.then(function(results){
			expect(results).to.not.be.undefined;
			expect(results).to.not.be.null;
			expect(results).to.not.be.empty;
		});
	});
	it('should return the title sent', function*() {
	return slack.postFile(title,message, debug)
		.then(function(results){
			slackBody = JSON5.parse(results.body);
			expect(slackBody.file.title).to.equal(title);
		});

	});
	it('should return the message sent', function*() {
	return slack.postFile(title,message, debug)
		.then(function(results){
			slackBody = JSON5.parse(results.body);
			expect(slackBody.file.initial_comment.comment).to.equal(message);

		});
  	});

});