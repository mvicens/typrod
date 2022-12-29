angular
	.module('app')
	.filter('answer', answer);

function answer() {
	return function (bool) {
		return bool ? 'Yes' : 'No';
	};
}