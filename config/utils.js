const path = require('path'),
  slash = require('slash');

const {USE_ROOT_PATHS} = require('./variables.js');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getAssetPath(from, to, pivot, prefix) {
  let retPath = '';
  if (prefix) {
    const lastChar = prefix[prefix.length - 1];
    if (lastChar === '/') {
      prefix = prefix.slice(0, -1);
    }
    retPath = slash(prefix + '/' + path.relative(pivot, to));
  } else if (prefix === null || prefix === undefined) {
    retPath = slash(path.relative(from.path, pivot) + '/' + path.relative(pivot, to));
  }
  if (retPath.length > 0) {
    const lastChar = retPath[retPath.length - 1];
    if (lastChar === '/' || lastChar === '\\') {
      retPath = retPath.slice(0, -1);
    }
  }
  if (prefix === null || prefix === undefined) {
    if (USE_ROOT_PATHS === false && (retPath[0] === '/' || retPath === '')) {
      retPath = '.' + retPath;
    }
  }
  return retPath;
}

function getBasename(path) {
  return slash(path).split('.')[0].split('/').reverse()[0];
}

function filterScripts(array, scriptsIncludes) {
  return array.filter(function(e) {
    var hold = scriptsIncludes.filter(function(ee) {
      return e.indexOf(ee) !== -1;
    });
    return hold[0] !== undefined;
  });
}

module.exports = {getRandomInt, getAssetPath, getBasename, filterScripts};
