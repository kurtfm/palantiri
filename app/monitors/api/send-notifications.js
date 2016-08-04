'use strict';
var Datadog = require('../../adapters/datadog');
const Promise = require('bluebird');

module.exports = (metricsPrefix,disableInfoNotices,report) => {
    return new Promise((resolve,  reject) => {
        var datadog = new Datadog();
        var errorState = score === 100 ?  'out ' : ''+ 'errors';
        var title = metricsPrefix + report.monitor + ' finished with ' + errorState;
        var total =  report.testcount;
        var score = report.score;
        var passes = report.passes;
        var failures = report.fails;
        var message = 'Results:\ntotal: '+total+'\npasses: '+passes+'\nfails: '+failures+'\nscore: '+score;
        var priority =  score === 100 ?  'low' : 'high';
        var level = score === 100 ?  'info' : 'error';
        if(disableInfoNotices && level === 'info'){
            resolve();
        }
        else{
            console.log(title);
         datadog.sendEvent(title,message,report.monitor,priority,level )
                .then(res =>{
                    resolve();
                }
                ).catch( error => {
                    console.log('error: ', error);
                    resolve();
                });
       }
    });
    
};