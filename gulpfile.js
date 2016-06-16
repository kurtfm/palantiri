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

gulp.task('test', function () {
	process.env.NODE_ENV = 'test';
	return gulp.src(['test/app/**/*.js','!test/app/resources/**','!test/outputs/**'], {read: false})
		.pipe(mocha({reporter:"xunit-file"}));
});

gulp.task('clean', function() {
    return del(['dist/**/*', 'dist/*.zip']);
});

gulp.task('package',['clean'],function(){
	var pkg = JSON.parse(fs.readFileSync('./package.json'));
	return gulp.src(['**/*','!test','!test/**','!dist','!dist/**','!.*','!*.*'])
    .pipe(tar('monitor-agent-' + pkg.version + '.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('dist'));
});

gulp.task('setup-snapshot', function(){
  return gulp.src('./package.json')
  .pipe(bump({type: "prerelease"}))
  .pipe(gulp.dest('./'));
});

gulp.task('setup-minor-release', function(){
  return gulp.src('./package.json')
  .pipe(bump({type: "minor"}))
  .pipe(gulp.dest('./'));
});

gulp.task('setup-major-release', function(){
  return gulp.src('./package.json')
  .pipe(bump({type: "major"}))
  .pipe(gulp.dest('./'));
});

gulp.task('dist', ['clean','test','package']);