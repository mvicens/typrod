angular
	.module('app')
	.factory('getStrDate', getStrDate);

function getStrDate() {
	return function (date) {
		return date.toISOString().split('T')[0];
	};
}