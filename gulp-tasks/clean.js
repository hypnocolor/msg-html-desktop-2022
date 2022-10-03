var gulp = require('gulp'),
	del = require('del'),
	fs = require('fs'),
	assets = JSON.parse(fs.readFileSync('./paths.json'));

gulp.task(clean);

function clean() {
	return del([assets.dest], { force:true });
}