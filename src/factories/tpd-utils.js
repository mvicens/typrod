angular
	.module('tpd')
	.factory('tpdUtils', tpdUtils);

function tpdUtils(tpd) {
	return {
		getTypeByProp: getTypeByProp,
		getAttrs: getAttrs
	};

	function getTypeByProp(prop) {
		return tpd.types()[prop.type];
	}

	function getAttrs(attrs) {
		var elemAttrs = {};
		angular.forEach(attrs.$attr, function (name, normalizedName) {
			elemAttrs[name] = attrs[normalizedName];
		});
		return elemAttrs;
	}
}