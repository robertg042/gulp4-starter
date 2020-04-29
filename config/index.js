const vars = require('./variables.js');
const utils = require('./utils.js');

const documents = require('./tasks/documents.js');
const styles = require('./tasks/styles.js');
const scripts = require('./tasks/scripts.js');
const server = require('./tasks/server.js');

const tasks = {documents, styles, scripts, server};

module.exports = {vars, utils, tasks}
