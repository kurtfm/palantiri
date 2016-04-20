yaml = require('js-yaml');
fs   = require('fs');

var env = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';

try {
  conf =  yaml.safeLoad(fs.readFileSync(__dirname+'/'+env+'.yml', 'utf8'));
  //console.log(conf);
} catch (e) {
  console.log(e);
}

var appRoot = function(){
	var current = __dirname.split('/');
	var le = current.length;
	var root = current.slice(0, le - 4);
	return root.join('/');

};
conf.application_root = appRoot();

module.exports = conf;