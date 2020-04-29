const gulp = require('gulp'),
  chalk = require('chalk'),
  del = require('del'),
  path = require('path');

const {parallel, series} = gulp;
require('events').EventEmitter.prototype._maxListeners = 100;

const {vars, tasks} = require('./config/index.js');

function copyAssets() {
  return gulp.src(path.join(vars.PATHS.SRC, '/assets/**/*'))
    .pipe(gulp.dest(path.join(vars.PATHS.OUT, '/static/')));
}

function clean() { return del(['dist']); }

function cleanProd() { return del(['dist/scripts/separate']); }

const watchers = {
  html: [],
  styles: [],
  js: []
};

function stopWatchHtml(done) {
  watchers.html.forEach(function(watcher) {return watcher.close()});
  done();
};
function stopWatchStyles(done) {
  watchers.styles.forEach(function(watcher) {return watcher.close()});
  done();
};
function stopWatchJs(done) {
  watchers.js.forEach(function(watcher) {return watcher.close()});
  done();
};

function watchHtml(done) {
  watchers.html = [];
  var seq = vars.OPTS.useServer ? [tasks.documents.main, stopWatchHtml, tasks.documents.killCache, tasks.server.reload, watchHtml] : [tasks.documents.main, stopWatchHtml, tasks.documents.killCache, watchHtml];
  watchers.html.push(gulp.watch(path.join(vars.PATHS.SRC, '/**/*.html'), series(...seq)));

  if (vars.OPTS.debugMode) console.log(chalk.redBright('===== ' + chalk.bgWhite.inverse(' gulp run with ' + chalk.bold('--rg-debug') + ' option! ') + ' ====='));
  done();
};

function watchStyles(done) {
  watchers.styles = [];
  watchers.styles.push(gulp.watch(path.join(vars.PATHS.SRC, '/**/*.scss'), series(tasks.styles.main, stopWatchStyles, tasks.styles.killCache, watchStyles)));

  if (vars.OPTS.debugMode) console.log(chalk.redBright('===== ' + chalk.bgWhite.inverse(' gulp run with ' + chalk.bold('--rg-debug') + ' option! ') + ' ====='));
  done();
};

function watchJs(done) {
  watchers.js = [];
  const scriptsSeries = tasks.scripts.getScriptSeries();
  tasks.scripts.scriptsToWatch.forEach(function(scriptToWatch, index) {
    watchers.js.push(gulp.watch(scriptToWatch, series(scriptsSeries[index], stopWatchJs, tasks.scripts.killCache, watchJs ) ));
  });

  if (vars.OPTS.debugMode) console.log(chalk.redBright('===== ' + chalk.bgWhite.inverse(' gulp run with ' + chalk.bold('--rg-debug') + ' option! ') + ' ====='));
  done();
};

exports.blank = function(done) {done()};

exports['run-html'] = series(clean,copyAssets, tasks.documents.main, tasks.documents.killCache);
exports['run-styles'] = series(clean, copyAssets, tasks.styles.main, tasks.styles.killCache);
exports['run-scripts'] = series(clean, copyAssets, tasks.scripts.main(), tasks.scripts.killCache);

exports.build = series(clean, copyAssets, parallel(tasks.documents.main, tasks.styles.main, tasks.scripts.main()), parallel(tasks.documents.killCache, tasks.styles.killCache, tasks.scripts.killCache), cleanProd);

if (vars.OPTS.useServer) {
  exports.default = series(clean, copyAssets, parallel(tasks.documents.main, tasks.styles.main, tasks.scripts.main()), parallel(tasks.documents.killCache, tasks.styles.killCache, tasks.scripts.killCache), parallel(watchHtml, watchStyles, watchJs), tasks.server.init);
} else {
  exports.default = series(clean, copyAssets, parallel(tasks.documents.main, tasks.styles.main, tasks.scripts.main()), parallel(tasks.documents.killCache, tasks.styles.killCache, tasks.scripts.killCache), parallel(watchHtml, watchStyles, watchJs));
}

