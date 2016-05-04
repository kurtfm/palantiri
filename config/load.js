const yaml = require('js-yaml');
const fs   = require('fs');
const _ = require('lodash');

var env = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';

try {
  conf =  yaml.safeLoad(fs.readFileSync(__dirname+'/'+env+'.yml', 'utf8'));
  //console.log(conf);
} catch (e) {
  console.log(e);
}

try {
  app =  yaml.safeLoad(fs.readFileSync(__dirname+'/app.yml', 'utf8'));
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

var properties = _.merge(app, conf);


module.exports = properties;