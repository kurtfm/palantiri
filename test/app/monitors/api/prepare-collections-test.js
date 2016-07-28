'use strict';

require('mocha-generators').install();
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require("fs"));
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const JSON5 = require('json5');

var conf = require('../../../../config/load');
const target = 'onetest';
const app = conf.application_root + conf.api_monitor;
const configureTests = require(app + 'prepare-collections');
const newmanFolder = conf.application_root + conf.newman_folder + target + '-';
const testFile = newmanFolder + conf.test_file;




describe('Prepare Collections Tests', function () {
    var data,firstTestName,firstTestId;
    before(function (done) {
         var testsData =  JSON5.parse(fs.readFileSync( testFile, 'utf8'));
         
         firstTestName = testsData.requests[0].name;
         firstTestId = testsData.requests[0].id;
         
         var configuredTests = configureTests(testsData);
         
         configuredTests.then((results) => {
             data = results.tests;
            done();
        });
    });

    it('should prepare tests and return something', function () {
        expect(data).to.not.be.undefined;
    });
    it('should have returned a name for the collection', function () {
        expect(data.name).to.not.be.undefined;
    });
    it('should not return the same name it passed in', function(){
        expect(data.requests[0].name).to.not.equal(firstTestName);
    });
    it('should return name combined with id', function(){
        expect(data.requests[0].name).to.equal( firstTestName + ' | ' + firstTestId);
    });
});


