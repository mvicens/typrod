const $ = require('jquery');
require('angular');
require('angular-translate');
const SPECIFICITY = require('specificity');
require('lodash');

// To access from the source code
window.jQuery = window.$ = $;
window.SPECIFICITY = SPECIFICITY;

require('./src/');
module.exports = 'tpd';