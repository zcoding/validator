var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var zip = require('gulp-zip');
var config = require('./package.json');

var source = ['bool-matrix', 'utils', 'validator', 'rules', 'api', 'extend', 'form-validator', 'exports'];

var moduleTypes = ['global', 'amd', 'cmd', 'commonjs'];

var sources = {
  "global": ['intro'].concat(source).concat(['outro']),
  "amd": ['intro-amd'].concat(source).concat(['outro']),
  "cmd": ['intro-cmd'].concat(source).concat(['outro']),
  "commonjs": source
};

moduleTypes.forEach(function(mType) {

  var source = sources[mType];
  var sourcePath = source.map(function(file) {
    return './src/' + file + '.js';
  });

  gulp.task('build-' + mType, function() {
    return gulp.src(sourcePath)
            .pipe(concat('validator.js', {newLine: '\n'}))
            .pipe(gulp.dest('build/' + mType))
            .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(rename('validator.min.js'))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('build/' + mType));
  });

});

gulp.task('build', ['build-global', 'build-amd', 'build-cmd', 'build-commonjs'], function() {
  console.log('All built.');
});

gulp.task('dev', ['build-global'], function() {

  var path = sources['global'].map(function(file) {
    return './src/' + file + '.js';
  });

  var watcher = gulp.watch(path, ['build-global']);

  watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });

});

gulp.task('release', function() {

  return gulp.src(['src/*', 'scripts/*', 'build/**/*', 'demo/*', 'index.js', 'gulpfile.js', 'LICENSE', 'package.json', 'README.md'], {base: '.'})
    .pipe(zip('validator-' + config.version + '.zip'))
    .pipe(gulp.dest('release'));

});
