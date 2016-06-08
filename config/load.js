const yaml = require('js-yaml');
const fs   = require('fs');
const _ = require('lodash');

var env = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';

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
conf.health_status = typeof process.env.HEALTHSTATUS !== 'undefined' && process.env.HEALTHSTATUS.toLowerCase() === 'false' ? false : true;
conf.slack_notifications = typeof process.env.SLACK !== 'undefined' && process.env.SLACK.toLowerCase() === 'false' ? false : true;
conf.env = env;
conf.target = process.env.API ? process.env.API : null;

var properties = _.merge(app, conf);


module.exports = properties;