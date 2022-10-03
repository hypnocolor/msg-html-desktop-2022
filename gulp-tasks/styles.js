var gulp = require('gulp'),
	fs = require('fs'),
	assets = JSON.parse(fs.readFileSync('./paths.json')),
	$ = require('gulp-load-plugins')(),
	csso = require('gulp-csso'),
	browserSync = require('browser-sync'),
	reload = browserSync.reload,
	autoprefixer = require('autoprefixer');

gulp.task(styles);

function styles() {
	return gulp.src(assets.styles.src)
		.pipe($.plumber())
		.pipe($.sass({
			outputStyle: 'expanded',
			includePaths: [
				assets.styles.dir
			]
		}).on('error', $.sass.logError))
		.pipe($.postcss([
			autoprefixer({ browsers: ['last 1 version'] }),
			require('css-mqpacker')()
		]))
		.pipe(csso())
		.pipe(gulp.dest(assets.styles.dest))
		.pipe(browserSync.reload({
			stream: true
		}));
}
