"use strict";
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

gulp.task('test-xunit', function() {
	process.env.NODE_ENV = 'test';
	return gulp.src(['test/app/**/*.js', '!test/app/resources/**',
			'!test/outputs/**'
		], {
			read: false
		})
		.pipe(mocha({
			reporter: "xunit-file"
		}));
});

gulp.task('test', function() {
	process.env.NODE_ENV = 'test';
	return gulp.src(['test/app/**/*.js', '!test/app/resources/**',
			'!test/outputs/**'
		], {
			read: false
		})
		.pipe(mocha());
});

gulp.task('dist-clean', function() {
	return del(['dist/**/*', 'dist/*.tar.gz']);
});

gulp.task('dist-source', ['clean'], function() {
	var pkg = JSON.parse(fs.readFileSync('./package.json'));
	return gulp.src(['**/*', '!test', '!test/**', '!dist', '!dist/**', '!.*',
			'!*.*'
		])
		.pipe(gulp.dest('dist/monitoring-app'));
});

gulp.task('dist-package', ['dist-source', 'dist-clean'], function() {
	var pkg = JSON.parse(fs.readFileSync('./package.json'));
	return gulp.src('dist/**/*')
		.pipe(tar('monitor-' + pkg.version + '.tar'))
		.pipe(gzip())
		.pipe(gulp.dest('dist/'));
});

gulp.task('docker-clean', function() {
	return del('docker/monitoring-app/**/*');
});

gulp.task('docker-source', ['docker-clean'], function() {
	var pkg = JSON.parse(fs.readFileSync('./package.json'));
	return gulp.src(['**/*', '!test', '!test/**', '!dist', '!dist/**',
			'!docker/**', '!.*',
			'!*.*'
		])
		.pipe(gulp.dest('docker/monitoring-app'));
});

gulp.task('prepare-release', function() {
	var argv = yargs.argv;
	var validBumpTypes = "major|minor|patch|prerelease".split("|");
	var ver = (argv.ver || 'patch').toLowerCase();
	var isRelease = argv.release ? true : false;

	if (validBumpTypes.indexOf(ver) === -1) {
		throw new Error('Unrecognized version "' + ver + '".');
	} else {
		return gulp.src('./package.json')
			.pipe(bump({
				type: argv.ver
			}))
			.pipe(gulp.dest('./'));
	}
});


gulp.task('dist', ['dist-clean', 'test', 'dist-package']);

gulp.task('docker-prep', ['docker-clean', 'docker-source']);
