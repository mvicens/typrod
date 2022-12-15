(function () {
	angular
		.module('tpd')
		.filter('tpdOption', tpdOption);

	function tpdOption() {
		return function (id, opts) {
			var item = _.find(opts, ['id', id]);
			return item && item.label;
		};
	}
})();