const $ = require('jquery');
require('angular');
const SPECIFICITY = require('specificity');
require('lodash');

// To access from the source code
window.jQuery = window.$ = $;
window.SPECIFICITY = SPECIFICITY;

require('./src/');
module.exports = 'tpd';