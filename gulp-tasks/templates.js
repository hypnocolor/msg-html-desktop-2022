var gulp = require('gulp'),
	$ = require('gulp-load-plugins')(),
	fs = require('fs'),
	assets = JSON.parse(fs.readFileSync('./paths.json')),
	emitty = require('emitty').setup('app/pages', 'pug', {
		makeVinylFile: true
	}),
	gulpif = require('gulp-if'),
	flatten = require('gulp-flatten'),
	beautifyCode = require('gulp-beautify-code');
	browserSync = require('browser-sync');

gulp.task(templates);
gulp.task(templatesGlobal);

function templates() {
	return new Promise((resolve, reject) => {
		const sourceOptions = global.watchFlag ? { read: false } : {};

		emitty.scan(global.emittyChangedFile).then(() => {
			gulp.src('app/pages/**/*.pug', sourceOptions)
				.pipe(gulpif(global.watchFlag, emitty.filter(global.emittyChangedFile)))
				.pipe($.data(function(file) {
					return JSON.parse(fs.readFileSync('app/data.json'))
				}))
				.pipe($.plumber())
				.pipe($.pug())
				.pipe(beautifyCode({
					indent_size: 4,
					indent_char: "	",
					indent_inner_html: true,
					// unformatted: ['button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'code', 'pre', 'em', 'strong', 'span', 'i', 'b', 'br']
				}))
				.pipe(flatten())
				.pipe($.versionAppend(['html', 'js', 'css'], {
					appendType: 'guid',
					versionFile: 'version.json'
				}))
				.pipe(gulp.dest(assets.dest))
				.on('end', resolve)
				.on('error', reject)
				.pipe(browserSync.stream());
		});
	});
}

function templatesGlobal() {
	return gulp.src('app/pages/**/*.pug')
		.pipe($.data(function(file) {
			return JSON.parse(fs.readFileSync('app/data.json'))
		}))
		.pipe($.plumber())
		.pipe($.pug())
		.pipe(beautifyCode({
			indent_size: 4,
			indent_char: "	",
			indent_inner_html: true,
			// unformatted: ['button', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'code', 'pre', 'em', 'strong', 'span', 'i', 'b', 'br']
		}))
		.pipe(flatten())
		.pipe($.versionAppend(['html', 'js', 'css'], {
			appendType: 'guid',
			versionFile: 'version.json'
		}))
		.pipe(gulp.dest(assets.dest))
		.pipe(browserSync.stream());
}