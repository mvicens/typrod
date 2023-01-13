require('angular');
const $ = require('jquery'),
	SPECIFICITY = require('specificity');
require('lodash');

// To access from the source code
window.$ = $;
window.SPECIFICITY = SPECIFICITY;

require('./src/');
module.exports = 'tpd';