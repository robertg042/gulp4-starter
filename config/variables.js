const parseArgs = require('minimist'),
  path = require('path');


const OPTS = parseArgs(process.argv.slice(2), {
  boolean: ['rg-debug', 'rg-server', 'rg-https', 'rg-open'],
  string: ['rg-env', 'rg-vhost'],
  default: {
    'rg-env': process.env.NODE_ENV || 'production',
    'rg-debug': false,
    'rg-server': false,
    'rg-https': false,
    'rg-open': true,
  },
  alias: {
    'rg-env': 'env',
    'rg-debug': 'debugMode',
    'rg-server': 'useServer',
    'rg-https': 'useHttps',
    'rg-open': 'openBrowser',
    'rg-vhost': 'vhost'
  }
});

let protocol = 'http';
if (OPTS.useHttps) {
  OPTS.useServer = true;
  protocol = 'https';
}

// relative paths
// let BASE_URL = null;
// absolute paths
let BASE_URL = OPTS.debugMode ? `${protocol}://127.0.0.1:3000/` : '/';

let USE_ROOT_PATHS = null;
if (BASE_URL === null) {
  USE_ROOT_PATHS = false; // if true, paths will start with '/'
}

const PATHS = {
  ROOT: path.join(__dirname, '../'),
  SRC: path.join(__dirname, '../src'),
  PAGES: path.join(__dirname, '../src', 'pages'),
  OUT: path.join(__dirname, '../dist'),
  STATIC: path.join(__dirname, '../dist/static'),
};

// Add more pages here
const PAGE_DATA = [
  {id: 'index', htmlDirPath: path.join(PATHS.OUT, '/'), htmlPath: '/', includedScripts: ['utils', 'index']},
  {id: 'about', htmlDirPath: path.join(PATHS.OUT, '/about'), htmlPath: '/about', includedScripts: ['utils', 'about']},
  {id: 'nested', htmlDirPath: path.join(PATHS.OUT, '/about'), htmlPath: '/about/nested', includedScripts: ['utils', 'nested']},
  {id: 'blog', htmlDirPath: path.join(PATHS.OUT, '/blog'), htmlPath: '/blog', includedScripts: ['utils', 'blog']},
];

const ADDITIONAL_SCRIPTS_DATA = [
  {id: 'more', htmlDirPath: path.join(PATHS.OUT, '/'), includedScripts: ['utils', 'index', 'about']}
];

const TEMPLATE_STRINGS = {
  root: '{{ROOT_PATH}}',
  out: '{{OUT_PATH}}',
  static: '{{STATIC_PATH}}',
}

module.exports = {ADDITIONAL_SCRIPTS_DATA, PATHS, OPTS, PAGE_DATA, TEMPLATE_STRINGS, BASE_URL, USE_ROOT_PATHS};
