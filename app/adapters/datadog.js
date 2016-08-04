'use strict';


var StatsD = require('hot-shots');
const Promise = require('bluebird');

module.exports = function (metricsPrefix) {
    console.log(metricsPrefix);
    var mock = process.env.NODE_ENV === 'test' ? true : false;
    
    var client = new StatsD('dd-agent',8125,metricsPrefix, '', false,false,mock);
    
    client.socket.on('error', function (error) {
        throw error;
        console.error("Error in socket for metrics: ", error);
    });
    

    
    this.sendCount = (metric,count,tags) => {
        return new Promise((resolve, reject) => {
            client.increment(metric, count,tags,(err,bytes)=>{
                if(err){
                    reject({"error":err});
                }
                else{
                    resolve({"bytes":bytes});
                }
            });
        });
    };
    this.sendGauge = (metric,level,tags) => {
        return new Promise((resolve, reject) => {
            client.gauge(metric, level,tags,(err,bytes)=>{
                if(err){
                    reject({"error":err});
                }
                else{
                    resolve({"bytes":bytes});
                }
            });
        });
    };
    this.sendHistogram = (metric,count,tags) => {
        return new Promise((resolve, reject) => {
            client.histogram(metric, count,tags,(err,bytes)=>{
                if(err){
                    reject({"error":err});
                }
                else{
                    resolve({"bytes":bytes});
                }
            });
        });
    };
    this.sendSet = (metric,unique,tags) => {
        return new Promise((resolve, reject) => {
            client.set(metric, unique,tags,(err,bytes)=>{
                if(err){
                    reject({"error":err});
                }
                else{
                    resolve({"bytes":bytes});
                }
            });
        });
    };
    this.sendEvent = (title,message,runName,priority,alertType) => {
        var options = {
            alert_type: alertType,
            aggregation_key:runName,
            priority: priority
        };
        return new Promise((resolve, reject) => {
            client.event(title, message,options,(err,resp)=>{
                if(err){
                    console.log(err);
                    reject({"error":err});
                }
                else{
                    console.log('client.event response: ', resp);
                     client.close( () => {resolve();} );
                }
            });
        });
     };

    this.finishedSendingMetrics = () => {
        return new Promise((resolve, reject) => {
            client.close( () => {resolve();} );
        });
    };

};