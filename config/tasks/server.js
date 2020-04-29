const browsersync = require('browser-sync').create();

const {OPTS} = require('../variables.js');

function init(done) {
  if (OPTS.vhost) {
    browsersync.init({
      proxy: `${OPTS.useHttps ? 'https' : 'http'}://${OPTS.vhost}`,
      notify: false,
      open: OPTS.openBrowser
    });
  } else {
    browsersync.init({
      server: {
        baseDir: "./dist"
      },
      notify: false,
      open: OPTS.openBrowser
    });
  }
  done();
};

function reload(done) {
  browsersync.reload();
  done();
};

module.exports = {browsersync, init, reload}
