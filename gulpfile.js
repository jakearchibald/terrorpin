const gulp = require('gulp');
const del = require('del');
const staticModule = require('static-module');
const quote = require('quote-stream');
const path = require('path');
const bl = require('bl');
const fs = require('fs');
const babel = require('gulp-babel');
const through = require('through2');
const sass = require('gulp-sass');
const promisify = require("promisify-node");
const watchify = require("watchify");
const browserify = require("browserify");
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const gutil = require('gulp-util');
const spawn = require('child_process').spawn;

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

function clean() {
  return del(['build', 'build-test']);
}

// Processes all scripts in src & embeds their CSS
function script() {
  const lastRun = gulp.lastRun(script) || 0;

  return gulp.src('src/**/*.js')
    .pipe(babel())
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
        fs: {
          readFileSync: function (file) {
            return gulp.src(file)
              .pipe(sass().on('error', sass.logError))
              .pipe(through.obj(function(file, enc, callback) {
                this.push(file.contents);
                callback();
              })).pipe(quote());
          }
        }
      }, { vars: { __dirname: path.dirname(file.path) } });

      const self = this;

      file.pipe(sm).pipe(bl(function(err, data){
        file.contents = data;
        self.push(file);
        return callback();
      }));
    }))
    .pipe(gulp.dest('build/'));
}

function testCopy() {
  return gulp.src('test/*.html')
    .pipe(gulp.dest('build-test/'));
}

function testScript(opts) {
  opts = opts || {};

  return gulp.src('test/*.js', {buffer: false})
    .pipe(through.obj(function(file, enc, callback) {
      const b = browserify({ cache: {}, packageCache: {} })
        .transform("babelify")
        .add(file.path);

      if (opts.watch) b.plugin(watchify);

      const bundle = () => {
        b.bundle()
          .on('error', gutil.log.bind(gutil, 'Browserify Error'))
          .pipe(source(path.basename(file.path)))
          //.pipe(buffer())
          .pipe(gulp.dest('build-test'));
      };

      b.on('update', bundle);
      bundle();
      callback();
    }));
}

function testSass() {
  return gulp.src('test/style.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('build-test'));
}

function watch() {
  gulp.watch('src/**', script);
}

function testWatch() {
  gulp.watch('test/*.html', testCopy);
  gulp.watch('test/*.sass', testSass);
  testScript({ watch: true });
}

function testServe() {
  spawn('http-server', ['build-test', '-p', '8000']);
  console.log('Serving on localhost:8000');
}

gulp.task(watch);
gulp.task('build', gulp.series(clean, script));

gulp.task('serve', gulp.series(
  'build',
  gulp.parallel(testCopy, testScript, testSass),
  gulp.parallel(watch, testWatch, testServe)
));
