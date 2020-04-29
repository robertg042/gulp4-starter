const gulp = require('gulp'),
  gulpif = require('gulp-if'),
  htmlmin = require('gulp-htmlmin'),
  lazypipe = require('lazypipe');
  merge = require('merge-stream'),
  path = require('path'),
  pipeline = require('readable-stream').pipeline,
  replace = require('gulp-replace');

const {BASE_URL, OPTS, PATHS, TEMPLATE_STRINGS} = require('../variables.js');
const {getRandomInt, getAssetPath} = require('../utils.js');

const templateRegex = {};

Object.entries(TEMPLATE_STRINGS).forEach(entry => {
  templateRegex[entry[0]] = new RegExp(entry[1], 'g');
});

const debugReplace = lazypipe()
  .pipe(replace, /<!--\s*DEBUG_START[\W\w]*\s*DEBUG_END\s*-->/g, function() {return ``});

function documents() {
  const streams = [];
  const curDir = { path: '' };
  streams.push(pipeline(
    gulp.src(path.join(PATHS.SRC, '/index.html')),
    gulpif(!OPTS.debugMode, debugReplace()),
    htmlmin({collapseWhitespace: true, minifyJS: true}),
    gulp.dest(PATHS.OUT),
    tap(function(file, t) {
      curDir.path = path.dirname(file.path);
    }),
    replace(templateRegex.out, function() {
      const path = getAssetPath(curDir, PATHS.OUT, PATHS.OUT, BASE_URL);
      return path;
    }),
    replace(templateRegex.static, function() {
      const path = getAssetPath(curDir, PATHS.STATIC, PATHS.OUT, BASE_URL);
      return path;
    }),
    gulp.dest(PATHS.OUT)
  ));

  const curDir2 = { path: '' };
  streams.push(pipeline(
    gulp.src(path.join(PATHS.PAGES, '/**/*.html')),
    gulpif(!OPTS.debugMode, debugReplace()),
    htmlmin({collapseWhitespace: true, minifyJS: true}),
    gulp.dest(PATHS.OUT),
    tap(function(file, t) {
      curDir2.path = path.dirname(file.path);
    }),
    replace(templateRegex.out, function() {
      const path = getAssetPath(curDir2, PATHS.OUT, PATHS.OUT, BASE_URL);
      return path;
    }),
    replace(templateRegex.static, function() {
      const path = getAssetPath(curDir2, PATHS.STATIC, PATHS.OUT, BASE_URL);
      return path;
    }),
    gulp.dest(PATHS.OUT)
  ));
  return merge(...streams);
}

function killDocumentsCache() {
  const random = getRandomInt(100, 99999);
  return pipeline(
    gulp.src(path.join(PATHS.OUT, '/**/*.html')),
    replace(/rg_cb=[.\d]+/g, function() {return `rg_cb=${random}`}),
    gulp.dest(PATHS.OUT)
  );
}

module.exports = {main: documents, killCache: killDocumentsCache};
