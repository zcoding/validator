var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var zip = require('gulp-zip');
var config = require('./package.json');

var source = ['intro', 'utils', 'validator', 'form-validator', 'rules', 'api', 'outro'];

var sourcePath = source.map(function(file) {
  return 'src/' + file + '.js';
});

// 根据不同的模块规范生成单独的文件（不再在一个文件中判断使用哪种规范）
var moduleTypes = ['amd', 'cmd', 'commonjs', 'es6'];

moduleTypes.forEach(function(mType) {

  gulp.task('build-' + mType, function() {
    var srcFiles = ['intro-' + mType].concat(sourcePath);
    return gulp.src(srcFiles)
            .pipe(concat('validator-' + mType + '.js', {newLine: '\n'}))
            .pipe(gulp.dest('build/' + mType))
            .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(rename('validator-' + mType + '.min.js'))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('build/' + mType));
  });

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

gulp.task('release', function() {

  gulp.src(['src/*', 'scripts/*', 'build/*', 'gulpfile.js', 'LICENSE', 'package.json', 'README.md'], {base: '.'})
    .pipe(zip('validator-' + config.version + '.zip'))
    .pipe(gulp.dest('release'));

});
