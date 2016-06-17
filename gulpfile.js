'use strict';
const gulp = require('gulp');
const mocha = require('gulp-mocha');
const tar = require('gulp-tar');
const gzip = require('gulp-gzip');
const exec = require('gulp-exec');
const bump = require('gulp-bump');
const fs = require('fs');
const install = require("gulp-install");
const del = require('del');
const yargs = require('yargs');

gulp.task('test', function () {
	process.env.NODE_ENV = 'test';
	return gulp.src(['test/app/**/*.js','!test/app/resources/**','!test/outputs/**'], {read: false})
		.pipe(mocha({reporter:"xunit-file"}));
});

gulp.task('clean', function() {
    return del(['dist/**/*', 'dist/*.tar.gz']);
});

gulp.task('source',['clean'],function(){
	var pkg = JSON.parse(fs.readFileSync('./package.json'));
	return gulp.src(['**/*','!test','!test/**','!dist','!dist/**','!.*','!*.*'])
    .pipe(gulp.dest('dist/monitor-agent-' + pkg.version+'/'));
});

gulp.task('package',['source','clean'],function(){
	var pkg = JSON.parse(fs.readFileSync('./package.json'));
	return gulp.src('dist/**/*')
	.pipe(tar('monitor-agent-' + pkg.version + '.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('dist/'));
});

gulp.task('prepare-release', function(){
	var argv = yargs.argv;
	var validBumpTypes = "major|minor|patch|prerelease".split("|");
	var ver = (argv.ver || 'patch').toLowerCase();
	var isRelease = argv.release ? true : false;

	if (validBumpTypes.indexOf(ver) === -1) {
	  throw new Error('Unrecognized version "' + ver + '".');
	}
	else{
	  return gulp.src('./package.json')
	  .pipe(bump({type: argv.ver}))
	  .pipe(gulp.dest('./'));
	}
});


gulp.task('dist', ['clean','test','package']);