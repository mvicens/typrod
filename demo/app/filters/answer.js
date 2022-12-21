angular
	.module('app')
	.filter('answer', answer);

function answer(translateFilter) {
	return function (bool) {
		return translateFilter(bool ? 'yes' : 'no');
	};
}