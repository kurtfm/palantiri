
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

module.exports = {
  s3Upload: (file, target, bucket, expiration) => {
    return new Promise((resolve, reject) => {
      assert.notStrictEqual(
        typeof file,
        "undefined",
        "file must be defined"
      );
      assert.notStrictEqual(
        typeof target,
        "undefined",
        "target must be defined"
      );
      assert.notStrictEqual(
        typeof bucket,
        "undefined",
        "bucket must be defined"
      );
      assert.notStrictEqual(
        typeof expiration,
        "undefined",
        "expiration must be defined"
      );
      const s3 = new AWS.S3({
        apiVersion: '2006-03-01'
      });
      const fileBuffer = fs.readFileSync(file);
      const params = {
        Bucket: bucket,
        Key: target + '/' + path.basename(file),
        Body: fileBuffer,
        ContentEncoding: 'utf-8',
        ContentType: 'application/json',
        Expires: new Date(new Date().setDate(new Date().getDate() +
          expiration))
      };
      s3.putObject(params, (err, data) => {
        if (err) {
          reject(err, err.stack);
        } else {
          resolve(data);
        }
      });
    });
  }
};
