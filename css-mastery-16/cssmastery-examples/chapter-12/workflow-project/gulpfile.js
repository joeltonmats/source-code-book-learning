var gulp = require('gulp');
var autoprefixer = require('autoprefixer');
var postcss = require('gulp-postcss');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');

gulp.task('browser-sync', function() {
  browserSync({server: {baseDir: "./"}});
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('styles', function(){
  var processors = [autoprefixer()];
  gulp.src(['*.scss'])
    .pipe(sass())
    .pipe(postcss(processors))
    .pipe(gulp.dest('./'))
    .pipe(browserSync.reload({stream:true}))
});

gulp.task('default', ['browser-sync'], function(){
  gulp.watch("*.scss", ['styles']);
  gulp.watch("*.html", ['bs-reload']);
});