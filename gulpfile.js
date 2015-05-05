var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var transform = require("vinyl-transform");
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');


var rootFiles = [{file: './client/SartScreen.js', outFile:"SartScreen.js", outDir: "./client/build/"}, {file: './client/GameMain.js', outFile:"GameMain.js", outDir: "./client/build/"}, {file: './client/ScoreBoard.js', outFile:"ScoreBoard.js", outDir: "./client/build/"}];

gulp.task('watch', getBundleAll(true));

gulp.task("bundle", getBundleAll(false));

function getBundleAll(watch) {
	var uglifyIt = process.env.NODE_ENV === "production";
	return function bundleAll() {
		var bunders = [];
		var length = rootFiles.length;
		var i;
		for(i = 0; i < length; i++) {
			var file = rootFiles[i];
			var options = {
				debug: true
			};
			var bundler = browserify();
			bundler.add(file.file, options);
			if(watch) {
				bundler = watchify(bundler);
			}
			
			var bundlerFuction = getBundleFunction(bundler, file, uglifyIt);
			bundlerFuction();
			bundler.on('update', bundlerFuction);
		}
	}
}

function getBundleFunction(bundler, file, uglifyIt) {
	return function bundle() {
	   bundler
	   .bundle()
	    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
	    .pipe(source(file.outFile))
	    //.pipe(buffer())
	    //.pipe(uglify({ mangle: uglifyIt }))
/*
	    .pipe(sourcemaps.init({loadMaps: true}))
	    
		.pipe(sourcemaps.write()) // loads map from browserify file
*/
	    .pipe(gulp.dest(file.outDir || './public/js/bundeldPackages'));
	    
	    console.log(getTimeStamp() + " rebuild: " + file.outFile);
	}
}

function getTimeStamp() {
	var now = new Date();
	return "[" + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "]";
}


