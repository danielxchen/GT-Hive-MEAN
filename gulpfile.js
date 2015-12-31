// load the plugins
var gulp      = require('gulp');
var jshint    = require('gulp-jshint');
var concat     = require('gulp-concat');
var uglify     = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var nodemon    = require('gulp-nodemon');

// task for linting js files
gulp.task('lint', function() {
  return gulp.src(['server.js', 'public/app/*.js', 'public/app/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// task to concatenate and minify frontend angular files
gulp.task('minify', function() {
  return gulp.src(['public/app/*.js', 'public/app/**/*.js'])
    .pipe(ngAnnotate())
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public/dist'));
});

// watch files to run tasks on changes 
gulp.task('watch', function() {
  gulp.watch(['server.js', 'public/app/*.js', 'public/app/**/*.js'], ['lint', 'minify']);
});

// start the server 
gulp.task('nodemon', function() {
  nodemon({
    script: 'server.js',
    ext: 'js css html',
    env: { 'NODE_ENV': 'development' },
    ignore: ['public/dist/*'],
    tasks: ['lint', 'minify']
  })
    .on('restart', function() {
      console.log('Restarted!');
    });
});

gulp.task('default', ['nodemon']);