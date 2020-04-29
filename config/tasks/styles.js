const gulp = require('gulp'),
  autoprefixer = require('autoprefixer'),
  cssnano = require('cssnano'),
  gulpif = require('gulp-if'),
  lazypipe = require('lazypipe');
  merge = require('merge-stream'),
  path = require('path'),
  pipeline = require('readable-stream').pipeline,
  postcss = require('gulp-postcss'),
  rename = require('gulp-rename'),
  replace = require('gulp-replace'),
  sass = require('gulp-sass'),
  tap = require('gulp-tap');

sass.compiler = require('sass');
const {BASE_URL, OPTS, PAGE_DATA, PATHS, TEMPLATE_STRINGS} = require('../variables.js');
const {getRandomInt, getAssetPath} = require('../utils.js');
const {browsersync} = require('./server');

const templateRegex = {};
Object.entries(TEMPLATE_STRINGS).forEach(entry => {
  templateRegex[entry[0]] = new RegExp(entry[1], 'g');
});

const debugReplace = lazypipe()
  .pipe(replace, /^[/\s]*DEBUG_START[\W\w]*\/\/\s*DEBUG_END/gm, function() {return ``});

const reloadPipe = lazypipe()
  .pipe(browsersync.stream);

function styles(done) {
  let outPath;

  const streams = PAGE_DATA.filter(page => page.id !== 'index').map(function(page) {
    const curDir = { path: '' };
    return pipeline(
      gulp.src(path.join(PATHS.PAGES, '/**/*.scss')),
      gulpif(!OPTS.debugMode, debugReplace()),
      sass().on('error', sass.logError),
      gulpif(OPTS.env !== 'production', gulp.dest(PATHS.OUT)),
      postcss([autoprefixer(), cssnano({ preset: 'default' })]),
      rename({ suffix: '.min'}),
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
      gulp.dest(PATHS.OUT),
      gulpif(OPTS.useServer, reloadPipe())
    )
  });

  outPath = PATHS.OUT;
  const curDir = { path: '' };
  streams.push(
    pipeline(
      gulp.src(path.join(PATHS.SRC, '/index.scss')),
      gulpif(!OPTS.debugMode, debugReplace()),
      sass().on('error', sass.logError),
      gulpif(OPTS.env !== 'production', gulp.dest(outPath)),
      postcss([autoprefixer(), cssnano({ preset: 'default' })]),
      rename({suffix: '.min'}),
      gulp.dest(outPath),
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
      gulp.dest(outPath),
      gulpif(OPTS.useServer, reloadPipe())
    )
  );

  outPath = path.join(PATHS.OUT, 'styles');
  const curDir2 = { value: '' };
  streams.push(
    pipeline(
      gulp.src(path.join(PATHS.SRC, '/shared/styles/**/*.scss')),
      gulpif(!OPTS.debugMode, debugReplace()),
      sass().on('error', sass.logError),
      gulpif(OPTS.env !== 'production', gulp.dest(outPath)),
      postcss([autoprefixer(), cssnano({ preset: 'default' })]),
      rename({suffix: '.min'}),
      gulp.dest(outPath),
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
      gulp.dest(outPath),
      gulpif(OPTS.useServer, reloadPipe())
    )
  );

  return merge(...streams);
}

function killStylesCache() {
  const random = getRandomInt(100, 99999);
  return pipeline(
    gulp.src(path.join(PATHS.OUT, '/**/*.min.css')),
    replace(/rg_cb=[.\d]+/g, function() {return `rg_cb=${random}`}),
    gulp.dest(PATHS.OUT));
}

module.exports = {main: styles, killCache: killStylesCache};
