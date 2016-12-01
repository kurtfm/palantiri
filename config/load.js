const yaml = require('js-yaml');
const fs = require('fs');
const _ = require('lodash');

var argv = require('yargs')
  .option('t', {
    alias: 'target',
    example: 'bin/api-monitor.js --target=brandapi-user',
    describe: 'the app or service you want to test'
  })
  .option('e', {
    alias: 'environment',
    example: 'bin/api-monitor.js --environment=test',
    describe: 'the environment to use',
    choices: ['dev', 'test', 'prod'],
    default: 'dev'
  })
  .option('disables3', {
    example: 'bin/api-monitor.js --disables3',
    describe: 'disable pushing of run details to s3',
    default: false
  })
  .option('disablemetrics', {
    example: 'bin/api-monitor.js --disablemetrics',
    describe: 'disable sending metrics to datadog',
    default: false
  })
  .option('metricsprefix', {
    example: 'bin/api-monitor.js --metricsprefix=beta',
    describe: 'add a metrics prefix to datadog metrics for testing',
  })
  .help('help')
  .alias('h', 'help')
  .argv;

//pick up test environment (automated tests)
var env;
if (process.env.NODE_ENV === 'test') {
  env = 'test';
} else {
  env = argv.environment ? argv.environment : 'dev';
}

//environment configs
try {
  var conf = yaml.safeLoad(fs.readFileSync(__dirname + '/' + env + '.yml',
    'utf8'));
  //console.log(conf);
} catch (e) {
  console.log(e);
}

//default configs
try {
  var app = yaml.safeLoad(fs.readFileSync(__dirname + '/app.yml', 'utf8'));
  //console.log(conf);
} catch (e) {
  console.log(e);
}

//runtime configs
var appRoot = function() {
  var current = __dirname.split('/');
  var root = _.slice(current, 0, current.length - 1);
  return root.join('/');

};

conf.application_root = appRoot();

if (argv.disables3) {
  conf.aws_s3_push_disabled = argv.disables3;
}
if (argv.disablemetrics) {
  conf.metrics_disabled = argv.disablemetrics;
}
if (argv.metricsprefix) {
  conf.metrics_prefix = argv.metricsprefix;
}
conf.env = env;
conf.target = argv.target ? argv.target : null;

//merge configs
var properties = _.merge(app, conf);

module.exports = properties;
