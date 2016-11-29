'use strict';
var StatsD = require('hot-shots');
const Promise = require('bluebird');
const assert = require('assert');

module.exports = function(metricsPrefix, metricsAgentHost, metricsAgentPort) {
  var mock = process.env.NODE_ENV === 'test' ? true : false;
  var client = new StatsD(metricsAgentHost, metricsAgentPort, metricsPrefix,
    '', false, false,
    mock);

  client.socket.on('error', function(error) {
    throw error;
    console.error("Error in socket for metrics: ", error);
  });


  this.sendCount = (metric, count, tags) => {
    return new Promise((resolve, reject) => {
      assert.notStrictEqual(
        typeof metric,
        "undefined",
        "metric must be defined"
      );
      assert.notStrictEqual(
        typeof count,
        "undefined",
        "count must be defined"
      );
      assert.notStrictEqual(
        typeof tags,
        "undefined",
        "tags must be defined"
      );
      client.increment(metric, count, tags, (err, bytes) => {
        if (err) {
          reject({
            "error": err
          });
        } else {
          resolve({
            "bytes": bytes
          });
        }
      });
    });
  };
  this.sendGauge = (metric, level, tags) => {
    return new Promise((resolve, reject) => {
      assert.notStrictEqual(
        typeof metric,
        "undefined",
        "metric must be defined"
      );
      assert.notStrictEqual(
        typeof level,
        "undefined",
        "count must be defined"
      );
      assert.notStrictEqual(
        typeof tags,
        "undefined",
        "tags must be defined"
      );
      client.gauge(metric, level, tags, (err, bytes) => {
        if (err) {
          reject({
            "error": err
          });
        } else {
          resolve({
            "bytes": bytes
          });
        }
      });
    });
  };
  this.sendHistogram = (metric, count, tags) => {
    return new Promise((resolve, reject) => {
      assert.notStrictEqual(
        typeof metric,
        "undefined",
        "metric must be defined"
      );
      assert.notStrictEqual(
        typeof count,
        "undefined",
        "count must be defined"
      );
      assert.notStrictEqual(
        typeof tags,
        "undefined",
        "tags must be defined"
      );
      client.histogram(metric, count, tags, (err, bytes) => {
        if (err) {
          reject({
            "error": err
          });
        } else {
          resolve({
            "bytes": bytes
          });
        }
      });
    });
  };
  this.sendSet = (metric, unique, tags) => {
    return new Promise((resolve, reject) => {
      assert.notStrictEqual(
        typeof metric,
        "undefined",
        "metric must be defined"
      );
      assert.notStrictEqual(
        typeof unique,
        "undefined",
        "count must be defined"
      );
      assert.notStrictEqual(
        typeof tags,
        "undefined",
        "tags must be defined"
      );
      client.set(metric, unique, tags, (err, bytes) => {
        if (err) {
          reject({
            "error": err
          });
        } else {
          resolve({
            "bytes": bytes
          });
        }
      });
    });
  };
  this.sendEvent = (title, message, runName, priority, alertType) => {
    var options = {
      alert_type: alertType,
      aggregation_key: runName,
      priority: priority
    };
    return new Promise((resolve, reject) => {
      assert.notStrictEqual(
        typeof title,
        "undefined",
        "title must be defined"
      );
      assert.notStrictEqual(
        typeof message,
        "undefined",
        "message must be defined"
      );
      assert.notStrictEqual(
        typeof runName,
        "undefined",
        "runName must be defined"
      );
      assert.notStrictEqual(
        typeof priority,
        "undefined",
        "priority must be defined"
      );
      assert.notStrictEqual(
        typeof alertType,
        "undefined",
        "alertType must be defined"
      );
      client.event(title, message, options, (err, resp) => {
        if (err) {
          reject({
            "error": err
          });
        } else {
          client.close(() => {
            resolve({
              'response': resp
            });
          });
        }
      });
    });
  };

  this.finishedSendingMetrics = () => {
    return new Promise((resolve, reject) => {
      client.close(() => {
        resolve();
      });
    });
  };

};
