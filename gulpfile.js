'use strict';

var gulp = require('gulp');
var bower = require('gulp-bower');

gulp.task('bower', function() {
  return bower();
    //.pipe(gulp.dest('./'));
});

gulp.task('install', ['bower', 'dist'], function() {
  gulp.src("./bower_components/network-js/dist/network.min.js")
    .pipe(gulp.dest("./public/dist"));
  gulp.src("./bower_components/network-js/server/server.php")
    .pipe(gulp.dest("./public/dist"));
});

gulp.task('dist', function() {
  return gulp.src("./src/*.js")
    .pipe(gulp.dest("./public/dist"));
});

gulp.task('default', ['dist'], function() {
  console.log('done');
});
