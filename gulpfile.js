var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var source = ['intro', 'utils', 'validator', 'form-validator', 'rules', 'api', 'outro'];

var sourcePath = source.map(function(file) {
  return 'src/' + file + '.js';
});

gulp.task('build', function() {

  return gulp.src(sourcePath)
    .pipe(concat('spa-public-validator.js', {newLine: '\n'}))
    .pipe(gulp.dest('build'))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename('spa-public-validator.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build'));

});

gulp.task('dev', function() {

  var watcher = gulp.watch(sourcePath, ['build']);

  watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });

});
