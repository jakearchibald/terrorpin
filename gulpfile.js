const gulp = require('gulp');
const del = require('del');
const staticModule = require('static-module');
const quote = require('quote-stream');
const path = require('path');
const bl = require('bl');
const fs = require('fs');
const through = require('through2');
const sass = require('gulp-sass');
const promisify = require("promisify-node");

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

function clean() {
  return del(['dist', 'dist-test']);
}

// Processes all scripts in src & embeds their CSS
function script() {
  const lastRun = gulp.lastRun(script) || 0;

  return gulp.src('src/**/*.js')
    // filter out unchanged files
    // Each file in the directory is checked so CSS changes work too
    .pipe(through.obj(function(file, enc, callback) {
      const pathName = path.dirname(file.path);
      readdir(pathName).then(files => {
        return Promise.all(
          files.map(file => stat(`${pathName}/${file}`))
        );
      }).then(stats => {
        if (stats.some(stat => stat.mtime > lastRun)) {
          this.push(file);
        }
        callback();
      });
    }))
    .pipe(through.obj(function(file, enc, callback) {
      const sm = staticModule({
        'gulp-preprocess': {
          inlineSass: file => {
            return gulp.src(file)
              .pipe(sass().on('error', sass.logError))
              .pipe(through.obj(function(file, enc, callback) {
                this.push(file.contents);
                callback();
              })).pipe(quote());
          },
          inlineText: file => {
            return gulp.src(file)
              .pipe(through.obj(function(file, enc, callback) {
                this.push(file.contents);
                callback();
              })).pipe(quote());
          }
        }
      }, { vars: { __dirname: path.dirname(file.path) } });

      const self = this;

      file.pipe(sm).pipe(bl(function(err, data) {
        console.log(err, file.path);
        file.contents = data;
        self.push(file);
        return callback();
      }));
    }))
    .pipe(gulp.dest('dist/'));
}

function watch() {
  gulp.watch('src/**', script);
}

gulp.task('build', gulp.series(clean, script));
gulp.task('watch', gulp.series(clean, script, watch));
