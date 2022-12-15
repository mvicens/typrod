angular
	.module('tpd')
	.filter('tpdOptions', tpdOptions);

function tpdOptions() {
	return function (ids, opts) {
		if (ids) {
			var list = [];
			angular.forEach(opts, function (opt) {
				if (ids.indexOf(opt.id) != -1)
					list.push(opt.label);
			});
			return list;
		}
	};
}