

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
const processVerboseLog = require(app + 'process-verbose-log');
const verboseLog=  conf.application_root + conf.test_data + target + conf.verbose_file_end;

describe('Process Debug Log Tests', function () {
    var data;
    before(function (done) {
        var processedVerboseLog = processVerboseLog(verboseLog);
        processedVerboseLog.then(function(debugInfo){
            data = debugInfo;
            done();
            }).catch((error) => {
                console.error( error.name, " : ",error.message);
            });
    });


    it('should process debug return something', function () {
        expect(data).to.not.be.undefined;
    });
    it('should return an array with requests', function () {
        expect( Array.isArray(data) ).to.be.true;
    });
    it('it should pull out the id from the name for each request', function () {
         for(var i = 0; i<data.length; i++){
             ( data[i].name ).should.not.contain( data[i].id );
         }
    });
    it('should return requests with all the expected keys', function () {
        for(var i = 0; i<data.length; i++){
            expect(data[i]).to.include.keys("name", "id","statusCode","totalTime", "method","endpoint","requestHeaders","requestData","responseHeaders", "responseBody");
        }
        

    });
});


