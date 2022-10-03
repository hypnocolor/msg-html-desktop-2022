var gulp = require('gulp'),
	fs = require('fs'),
	$ = require('gulp-load-plugins')(),
	assets = JSON.parse(fs.readFileSync('./paths.json')),
	browserSync = require('browser-sync'),
	src = [].concat(assets.scripts.vendors, assets.scripts.src),

	path = require('path');

gulp.task(svg);

function svg() {
	return gulp.src(assets.svg.src)
		.pipe($.svgmin(file => {
			const prefix = path.basename(file.relative, path.extname(file.relative));
			return {
				plugins: [{
					removeUselessStrokeAndFill: false
				}, {
					cleanupIDs: {
						prefix: prefix + '-',
						// minify: true
					}
				}]
			};
		}))
		.pipe($.rename({prefix: 'icon-'}))
		.pipe($.svgstore({inlineSvg: true}))
		.pipe($.rename('sprite.svg'))
		.pipe(gulp.dest(assets.svg.dest));
}