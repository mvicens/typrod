angular
	.module('tpd')
	.provider('tpdGetStr', tpdGetStrProvider);

function tpdGetStrProvider() {
	this.$get = $get;
	this.getStr = getStr;

	function $get() {
		return getStr;
	};

	function getStr(v, arg, hasElem) {
		if (angular.isString(v))
			return v;
		if (angular.isFunction(v)) {
			if (arg)
				return v(arg);
			return v;
		}
		if (hasElem && angular.isElement(v))
			return $(v).appendTo('<div>').parent().html();
		if (angular.isArray(v)) { // Joining array
			var result = [],
				isLastStr = false;
			angular.forEach(v, function (v2, i) {
				v2 = getStr(v2, arg, hasElem);
				if (angular.isString(v2)) {
					if (isLastStr)
						result[result.length - 1] += v2;
					else
						result.push(v2);
					isLastStr = true;
				} else {
					result.push(v2);
					isLastStr = false;
				}
			});
			if (result.length == 1)
				return result[0];
			return result;
		}
	}
}