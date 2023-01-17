angular
	.module('tpd')
	.provider('tpdRegisterUtils', tpdRegisterUtilsProvider);

function tpdRegisterUtilsProvider() {
	this.$get = $get;
	this.showError = showError;
	this.toString = toString;

	function $get() {
		return {
			showError: showError,
			toString: toString
		};
	}

	function showError(code, v) {
		var txts = {
			TRN: 'Tpd type refused, due to: wrong type of name',
			TRO: 'Tpd type refused, due to: wrong type of options',
			TNR: 'Tpd type "' + v + '" is not registered',
			TSU: 'Tpd type "string" is undeletable',
			CRS: 'TPD component refused, due to: wrong type of selector',
			CRC: 'TPD component refused, due to: wrong type of TPD content',
			CNR: 'TPD component "' + v + '" is not registered',
			CRE: 'TPD component refused, due to: wrong type of exceptional TPD containers',
			CNM: 'TPD component is not matched'
		};
		return console.error(txts[code]);
	}

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