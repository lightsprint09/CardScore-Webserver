var gulp = require('gulp');
var watchify = require('watchify');
var browserify = require('browserify');
var babelify = require('babelify');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');


function getWatchBundler(rootFiles) {
	return getBundler(rootFiles, true)
}

function getBundler(rootFiles, watch) {
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
			
			var bundlerFuction = getBundleFunction(bundler, file);
			bundlerFuction();
			bundler.on('update', bundlerFuction);
		}
	}
}

function getBundleFunction(bundler, file) {
	return function bundle() {
	   bundler
	   .transform(babelify)
	   .bundle() 
	   .pipe(source(file.outFile))
	   .pipe(gulp.dest(file.outDir));
	    
	    console.log(getTimeStamp() + " rebuild: " + file.outFile);
	}
}

function getTimeStamp() {
	var now = new Date();
	return "[" + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "]";
}

module.exports = {
	getWatchBundler: getWatchBundler,
	getBundler: getBundler
}