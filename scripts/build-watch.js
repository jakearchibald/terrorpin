"use strict";

const argv = require('minimist')(process.argv.slice(2));
const fs = require("fs");
const watchify = require("watchify");
const browserify = require("browserify");
const spawn = require('child_process').spawn;
const spawnSync = require('child_process').spawnSync;

const files = [
  'presentation',
  'slide'
];

for (var file of files) {
  let inFile = `./src/${file}/index.js`;
  let outFile = `./build/${file}.js`;

  spawnSync('babel', [inFile, '-o', outFile]);
  if (argv.watch) spawn('babel', [inFile, '-o', outFile, '-w']);
}
