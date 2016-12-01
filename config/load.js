const yaml = require('js-yaml');
const fs   = require('fs');
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
     	choices: ['dev','test','prod'],
     	default: 'dev'
    })
    .option('disablehealth', {
    	example: 'bin/api-monitor.js --disablehealth',
    	describe: 'disable healthstatus output',
     	default: false
    })
    .option('disableslack', {
    	example: 'bin/api-monitor.js --disableslack',
    	describe: 'disable slack notifications',
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
    .alias('h','help')
    .argv;

//pick up test environment (automated tests)
var env;
if(process.env.NODE_ENV === 'test'){
	env = 'test';
}
else{
	env = argv.environment ? argv.environment : 'dev';
}

//environment configs
try {
  var conf =  yaml.safeLoad(fs.readFileSync(__dirname+'/'+env+'.yml', 'utf8'));
  //console.log(conf);
} catch (e) {
  console.log(e);
}

//default configs
try {
  var app =  yaml.safeLoad(fs.readFileSync(__dirname+'/app.yml', 'utf8'));
  //console.log(conf);
} catch (e) {
  console.log(e);
}

//runtime configs
var appRoot = function(){
	var current = __dirname.split('/');
	var root = _.slice(current, 0, current.length-1);
	return root.join('/');

};

conf.application_root = appRoot();

if(argv.disablehealth){
  conf.disable_health_status = argv.disablehealth;
}
if(argv.disableslack){
    conf.disable_slack_notifications = argv.disableslack;
}
if(argv.disablemetrics){
    conf.disable_metrics = argv.disablemetrics;
}
if(argv.metricsprefix){
  conf.metrics_prefix = argv.metricsprefix;
}
conf.env = env;
conf.target = argv.target ? argv.target : null;

//merge configs
var properties = _.merge(app, conf);

module.exports = properties;
