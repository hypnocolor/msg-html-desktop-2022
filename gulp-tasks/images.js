var gulp = require('gulp'),
	fs = require('fs'),
	$ = require('gulp-load-plugins')(),
	assets = JSON.parse(fs.readFileSync('./paths.json')),
	browserSync = require('browser-sync');

gulp.task(images);

function images() {
	return gulp.src(assets.images.src)
		.pipe($.plumber())
		.pipe(gulp.dest(assets.images.dest))
		.pipe(browserSync.stream());
}