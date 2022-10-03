var gulp = require('gulp'),
	fs = require('fs'),
	$ = require('gulp-load-plugins')(),
	assets = JSON.parse(fs.readFileSync('./paths.json')),
	browserSync = require('browser-sync'),
	src = [].concat(assets.scripts.vendors, assets.scripts.src);

gulp.task(scripts);

function scripts() {
	return gulp.src(src)
		.pipe($.plumber())
		.pipe($.concat('main.js'))
		.pipe($.uglify())
		.pipe(gulp.dest(assets.scripts.dest))
		.pipe(browserSync.stream());
}