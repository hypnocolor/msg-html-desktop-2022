var gulp = require('gulp'),
	fs = require('fs'),
	assets = JSON.parse(fs.readFileSync('./paths.json'));

gulp.task(fonts);

function fonts() {
	return gulp.src(assets.fonts.src)
		.pipe(gulp.dest(assets.fonts.dest));
}