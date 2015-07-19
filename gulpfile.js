var gulp = require('gulp');
var concat = requrie('gulp-concat');

var source = ['intro', 'utils', 'validator', 'rules', 'api', 'outro'];

var sourcePath = source.map(function(file) {
  return 'src/' + file + '.js';
});

gulp.task('build', function() {

  gulp.src(sourcePath)
    .pipe(concat('spa-public-validator.js'));

});