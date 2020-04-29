const gulp = require('gulp'),
  babel = require('gulp-babel'),
  concat = require('gulp-concat'),
  gulpif = require('gulp-if'),
  lazypipe = require('lazypipe');
  merge = require('merge-stream'),
  path = require('path'),
  pipeline = require('readable-stream').pipeline,
  rename = require('gulp-rename'),
  replace = require('gulp-replace'),
  uglify = require('gulp-uglify');

const {series, parallel} = gulp;
const {ADDITIONAL_SCRIPTS_DATA, BASE_URL, OPTS, PAGE_DATA, PATHS, TEMPLATE_STRINGS} = require('../variables.js');
const {getBasename, filterScripts, getRandomInt, getAssetPath} = require('../utils.js');

const templateRegex = {};
Object.entries(TEMPLATE_STRINGS).forEach(entry => {
  templateRegex[entry[0]] = new RegExp(entry[1], 'g');
});

const scriptsArray = [
  // {path: 'node_modules/smoothscroll-polyfill/dist/smoothscroll.min.js', transform: false, watch: false},
  {path: path.join(PATHS.SRC, '/shared/js/utils.js'), transform: OPTS.env === 'production', watch: true},
  {path: path.join(PATHS.SRC, '/index.js'), transform: OPTS.env === 'production', watch: true},
  {path: path.join(PATHS.PAGES, '/about/about.js'), transform: OPTS.env === 'production', watch: true},
  {path: path.join(PATHS.PAGES, '/about/nested/nested.js'), transform: OPTS.env === 'production', watch: true},
  {path: path.join(PATHS.PAGES, '/blog/blog.js'), transform: OPTS.env === 'production', watch: true},
]

var allSciptsTasks = []; // raw files names of scriptsArray
var scriptsToWatchBasenames = []; // raw files names of scriptsToUglify
var allScriptsOutPath = []; // paths of all scripts in 'dist/scripts/separate'
var scriptsToWatch = []; // paths of scripts that are processed by babel and uglified

scriptsArray.forEach(function(single, index) {
  if (single.watch) {
    scriptsToWatch.push(single.path);
    scriptsToWatchBasenames.push(getBasename(single.path));
  }
});

const debugReplace = lazypipe()
  .pipe(replace, /^[/\s]*DEBUG_START[\W\w]*\/\/\s*DEBUG_END/gm, function() {return ``});

const transform = lazypipe()
  .pipe(babel, { "presets": [ ["@babel/preset-env", { "modules": false }] ] })
  .pipe(uglify, {compress: {drop_debugger: !OPTS.debugMode}});

scriptsArray.forEach(function(single) {
  var basename = getBasename(single.path); // raw file name
  allSciptsTasks.push(basename);
  allScriptsOutPath.push('dist/scripts/separate/' + basename + '.js');

  gulp.task(basename, function() {
    return pipeline(
      gulp.src(single.path),
      gulpif(!OPTS.debugMode, debugReplace()),
      gulpif(single.transform, transform()),
      rename({basename: basename, suffix: ''}),
      gulp.dest('dist/scripts/separate')
    );
  });
});

const scriptsTaskNames = [...PAGE_DATA.map(page => page.id)].map(page => `concat-${page}`);

[...PAGE_DATA].forEach(function(page, index) {
  gulp.task(scriptsTaskNames[index], function(done) {
    if (page.includedScripts && page.includedScripts.length > 0) {
      return pipeline(
        gulp.src(filterScripts(allScriptsOutPath, page.includedScripts)),
        concat(page.id + '.min.js'),
        gulp.dest('dist/scripts'),
        replace(templateRegex.out, function() {
          const path = getAssetPath({path: page.htmlDirPath}, PATHS.OUT, PATHS.OUT, BASE_URL);
          return path;
        }),
        replace(templateRegex.static, function() {
          const path = getAssetPath({path: page.htmlDirPath}, PATHS.STATIC, PATHS.OUT, BASE_URL);
          return path;
        }),
        gulp.dest('dist/scripts')
      );
    } else {
      done();
    }
  });
});

const additionalScriptsTaskNames = [...ADDITIONAL_SCRIPTS_DATA.map(data => data.id)].map(data => `concat-${data}`);
[...ADDITIONAL_SCRIPTS_DATA].forEach(function(data, index) {
  gulp.task(additionalScriptsTaskNames[index], function(done) {
    if (data.includedScripts && data.includedScripts.length > 0) {
      return pipeline(
        gulp.src(filterScripts(allScriptsOutPath, data.includedScripts)),
        concat(data.id + '.min.js'),
        gulp.dest('dist/scripts'),
        replace(templateRegex.out, function() {
          const path = getAssetPath({path: data.htmlDirPath}, PATHS.OUT, PATHS.OUT, BASE_URL);
          return path;
        }),
        replace(templateRegex.static, function() {
          const path = getAssetPath({path: data.htmlDirPath}, PATHS.STATIC, PATHS.OUT, BASE_URL);
          return path;
        }),
        gulp.dest('dist/scripts')
      );
    } else {
      done();
    }
  });
});

function scripts() {
  return series(parallel(...allSciptsTasks), ...scriptsTaskNames, ...additionalScriptsTaskNames);
}

function getScriptSeries() {
  const watchSeries = [];

  scriptsToWatchBasenames.forEach(function(elem,i){
    watchSeries.push(series(scriptsToWatchBasenames[i], ...scriptsTaskNames, ...additionalScriptsTaskNames))
  });
  return watchSeries;
}

function killScriptsCache() {
  const random = getRandomInt(100, 99999);
  return pipeline(
    gulp.src(path.join(PATHS.OUT, '/**/*.js')),
    replace(/rg_cb=[.\d]+/g, function() {return `rg_cb=${random}`}),
    gulp.dest(PATHS.OUT));
}

module.exports = {main: scripts, killCache: killScriptsCache, getScriptSeries, scriptsToWatch};
