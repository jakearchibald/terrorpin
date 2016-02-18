const fs = require("fs");
const watchify = require("watchify");
const browserify = require("browserify");
const copyfiles = require('copyfiles');
const chokidar = require('chokidar');
const spawn = require('child_process').spawn;
const spawnSync = require('child_process').spawnSync;

// JS
const b = browserify({
  entries: ['./test/script.js'],
  cache: {},
  packageCache: {},
  plugin: [watchify]
}).transform("babelify");

const bundle = () => {
  b.bundle()
    .on('error', err => console.log(err.message))
    .pipe(fs.createWriteStream('build-test/script.js'));
};

b.on('update', bundle);
bundle();

// HTML
const copyPaths = ['test/index.html'];

function copy() {
  copyfiles(copyPaths.concat(['build-test']), 1, () => {});
}

chokidar.watch(copyPaths).on('all', copy);
copy();

// Sass
spawnSync('node-sass', ['test', '-o', 'build-test']);
spawn('node-sass', ['test', '-o', 'build-test', '-w']);

// Server
spawn('http-server', ['build-test', '-p', '8000']);
console.log('Serving on localhost:8000')
