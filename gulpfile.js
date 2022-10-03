var gulp = require('gulp'),
	fs = require('fs'),
	assets = JSON.parse(fs.readFileSync('./paths.json')),
	HubRegistry = require('gulp-hub'),
	hub = new HubRegistry(['gulp-tasks/*.js']);

gulp.registry(hub);

gulp.task('watch', function() {
	global.watchFlag = true;

	gulp.watch(['app/pages/**/*.pug', 'app/layout/**/*.pug'], gulp.series('templates'))
		.on('all', (event, filepath) => {
			global.emittyChangedFile = filepath;
		});

	gulp.watch(['app/data.json', 'app/blocks/**/*', 'app/pages/**/*.html'], gulp.series('templatesGlobal'));

	gulp.watch(assets.styles.watch, gulp.series('styles'));
	gulp.watch(assets.images.src, gulp.series('images'));
	gulp.watch(assets.svg.src, gulp.series('svg'));
	gulp.watch(assets.fonts.src, gulp.series('fonts'));
	gulp.watch([].concat(assets.scripts.src, 'app/assets/scripts/lib/*.js'), gulp.series('scripts'));
})

gulp.task('build', gulp.parallel('styles', 'scripts', 'images', 'svg', 'fonts', 'templatesGlobal'));
gulp.task('default', gulp.series('clean', 'build', 'server', 'watch'));