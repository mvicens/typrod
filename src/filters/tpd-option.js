angular
	.module('tpd')
	.filter('tpdOption', tpdOption);

function tpdOption() {
	return function (id, items) {
		var item = _.find(items, ['id', id]);
		return item && item.label;
	};
}