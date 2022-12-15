(function () {
	angular
		.module('tpd')
		.filter('tpdPassword', tpdPassword);

	function tpdPassword() {
		return function (str) {
			return _.repeat('●', _.size(str));
		};
	}
})();