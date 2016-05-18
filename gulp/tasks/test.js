const gulp = require('gulp');
const mocha = require('gulp-mocha');

gulp.task('test', function () {
	return gulp.src('test/*-test.js', {read: false})
		.pipe(mocha({timeout:15000}))
		.once('end', function () {
	      process.exit();
	    });
});