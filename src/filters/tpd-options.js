angular
	.module('tpd')
	.filter('tpdOptions', tpdOptions);

function tpdOptions() {
	return function (ids, items) {
		if (ids) {
			var list = [];
			angular.forEach(items, function (item) {
				if (ids.indexOf(item.id) != -1)
					list.push(item.label);
			});
			return list;
		}
	};
}