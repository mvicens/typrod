angular
	.module('tpd')
	.provider('tpdToString', tpdToStringProvider);

function tpdToStringProvider() {
	this.$get = $get;
	this.toString = toString;

	function $get() {
		return toString;
	};

	function toString(v, arg, hasElem) {
		if (angular.isString(v))
			return v;
		if (angular.isFunction(v)) {
			if (arg) // No functions remains
				return v(arg);
			return v;
		}
		if (hasElem && angular.isElement(v))
			return $(v).appendTo('<div>').parent().html();
		if (angular.isArray(v)) { // Joining array
			var result = [],
				isLastStr = false;
			angular.forEach(v, function (v2) {
				v2 = toString(v2, arg, hasElem);
				if (angular.isString(v2)) {
					if (isLastStr)
						result[result.length - 1] += v2;
					else
						result.push(v2);
					isLastStr = true;
				} else { // Fn.
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