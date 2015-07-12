var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require("gulp-babel");
var changed = require('gulp-changed');

var browserifyClient = require("./browserify-gulp-client.js");
var sourceDir = "server/**/*.js";
var buildFolder = "build/server";

var rootFiles = [{file: './client/SartScreen.js', outFile:"SartScreen.js", outDir: "./build/client/"}, {file: './client/GameMain.js', outFile:"GameMain.js", outDir: "./build/client/"}, {file: './client/ScoreBoard.js', outFile:"ScoreBoard.js", outDir: "./build/client/"}];

gulp.task("default", ["build", "browserify"]);

gulp.task("build", build);

gulp.task("watch", ["buildWatch", 'watchify'], watch);

gulp.task("buildWatch", buildWatchCore);

gulp.task('watchify', browserifyClient.getWatchBundler(rootFiles));

gulp.task("browserify", browserifyClient.getBundler(rootFiles));

function watch() {
	var watcher = gulp.watch(sourceDir, ["buildWatch"]);
}

function build() {
	return buildTransform(sourceDir, buildFolder);
}

function buildWatchCore() {
	return buildWatch(sourceDir, buildFolder);
}

function buildWatch(file, destination) {
  return gulp.src(file)
  	.pipe(changed(destination))
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(destination));
}

function buildTransform(file, destination) {
  return gulp.src(file)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(destination));
}
