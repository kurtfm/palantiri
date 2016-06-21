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
    .help('help')
    .alias('h','help')
    .argv;

//limitation of how I am loading the configuration for automated tests
var env;
if(process.env.NODE_ENV == 'test'){
	env = 'test';
}
else{
	env = argv.environment ? argv.environment : 'dev';
}

try {
  var conf =  yaml.safeLoad(fs.readFileSync(__dirname+'/'+env+'.yml', 'utf8'));
  //console.log(conf);
} catch (e) {
  console.log(e);
}

try {
  var app =  yaml.safeLoad(fs.readFileSync(__dirname+'/app.yml', 'utf8'));
  //console.log(conf);
} catch (e) {
  console.log(e);
}


var appRoot = function(){
	var current = __dirname.split('/');
	var root = _.slice(current, 0, current.length-1);
	return root.join('/');

};

conf.application_root = appRoot();
conf.disable_health_status = argv.disablehealth;
conf.disable_slack_notifications = argv.disableslack;
conf.env = env;
conf.target = argv.target ? argv.target : null;
var properties = _.merge(app, conf);

module.exports = properties;