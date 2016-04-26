'use strict';

const JSON5 = require('json5');
const Promise = require('bluebird');
const healthcheckFormatter = require('./healthcheck-formatter');

module.exports = function(data){

	//build healthcheck report
	var report = require(data.jsonReport);

	healthcheckFormatter(report)
		.then(
			function(healthcheck){
				fs.writeFileSync( data.outputFolder + '/healthcheck/' + data.target + '.json', JSON5.stringify(healthcheck) );
			}
		);

	//call argus

	//for (var i = 0, len = results.length; i < len; i++) {
	  //console.log(results[i]);
	//}
	//save to db

	//notification

	//clean up files

	fs.unlink(data.htmlSummary, function(err){
	   if (err) throw err;
	   console.log(data.htmlSummary + " deleted");
	});
	fs.unlink(data.xmlSummary, function(err){
	   if (err) throw err;
	   console.log(data.xmlSummary + " deleted");
	});
	fs.unlink(data.jsonReport, function(err){
	   if (err) throw err;
	   console.log(data.jsonReport + " deleted");
	});
	
	fs.unlink(data.debugLog, function(err){
	   if (err) throw err;
	   console.log(data.debugLog + " deleted");
	});

};