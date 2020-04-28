var gulp = require('gulp');
var watch = require('gulp-watch');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var templateCache = require('gulp-angular-templatecache');
var gulpUtil = require('gulp-util');

var dest = 'build/public/';

gulp.task('default', ['watch']);

gulp.task('templates', function () {
  return gulp.src('templates/*.html')
    .pipe(templateCache({standalone: true}))
    .pipe(gulp.dest(dest + 'html'));
});

gulp.task('watch', function() {
  gulp.watch('templates/*.html', ['templates']);
});
