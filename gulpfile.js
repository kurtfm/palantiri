'use strict';
const gulp = require('gulp');
const mocha = require('gulp-mocha');
const zip = require('gulp-zip');
const notify = require('gulp-notify');

gulp.task('test', function () {
	process.env.NODE_ENV = 'test';
	return gulp.src(['test/app/**/*.js','!test/app/resources/**','!test/outputs/**'], {read: false})
		.pipe(mocha())
		.once('end', function () {
	      process.exit();
	    });
});

gulp.task('package',function(){
	return gulp.src(['**/*','!test','!test/**','!dist','!dist/**','!.*','!*.*'])
    .pipe(zip('monitor-agent.zip'))
    .pipe(gulp.dest('dist'))
	.pipe(notify({message: 'package task complete'}));
});