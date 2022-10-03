var gulp = require('gulp'),
	fs = require('fs'),
	assets = JSON.parse(fs.readFileSync('./paths.json')),
	browserSync = require('browser-sync'),
	portfinder = require('portfinder');

gulp.task(server);

function server(cb) {
	portfinder.getPort(function (err, port) {
		browserSync.init({
			startPath: '/index.html',
			server: {
				baseDir: assets.dest
			},
			notify: false,
			port: port
		});
	});

	cb();
}