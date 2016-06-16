const yaml = require('js-yaml');
const fs   = require('fs');
const _ = require('lodash');
const yargs = require('yargs');

var argv = yargs.argv;
var env = argv.environment ? argv.environment : 'dev';

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
conf.health_status = argv.healthstatus &&  argv.healthstatus === 'false' ? false : true;
conf.slack_notifications = argv.slack && argv.slack === 'false' ? false : true;
conf.env = env;
conf.target = argv.target ? argv.target : null;

var properties = _.merge(app, conf);


module.exports = properties;