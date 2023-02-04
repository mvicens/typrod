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
			TRN: 'TPD type refused, due to: wrong type of argument "name"',
			TRO: 'TPD type "' + v + '" refused, due to: wrong type of argument "opts"',
			TROF: 'TPD type "' + v + '" refused, due to: wrong type of option "fromJson"',
			TROT: 'TPD type "' + v + '" refused, due to: wrong type of option "toJson"',
			TROI: 'TPD type "' + v + '" refused, due to: wrong type of option "input"',
			TROO: 'TPD type "' + v + '" refused, due to: wrong type of option "output"',
			TNR: 'TPD type "' + v + '" is not registered',
			TSU: 'TPD type "' + v + '" is undeletable',
			TSI: 'TPD type "' + v + '" must to define option "input"',
			CRS: 'TPD component refused, due to: wrong type of argument "selector"',
			CRC: 'TPD component with selector "' + v + '" refused, due to: wrong type of argument "content"',
			CRE: 'TPD component with selector "' + v + '" refused, due to: wrong type of argument "ec"',
			CNR: 'TPD component with selector "' + v + '" is not registered',
			CNM: 'No matched TPD component',
			PRT: 'TPD property refused due to unregistered TPD type "' + v + '"'
		};
		return console.error(txts[code]);
	}

	function toString(v, arg) {
		if (_.isString(v))
			return v;
		if (angular.isFunction(v)) {
			if (arg) // No functions remains
				return toString(v(arg));
			return v;
		}
		if (_.isElement(v))
			return $(v).appendTo('<div>').parent().html();
		if (angular.isArray(v)) { // Joining array
			var result = [],
				isLastStr = false,
				hasNull = false;
			_.forEach(v, function (v2) {
				v2 = toString(v2, arg);
				if (_.isString(v2)) {
					if (isLastStr)
						result[result.length - 1] += v2;
					else
						result.push(v2);
					isLastStr = true;
				} else if (v2 === null) {
					hasNull = true;
					return false;
				} else { // Fn. or array with some
					result.push(v2);
					isLastStr = false;
				}
			});
			if (hasNull)
				return null;
			if (result.length == 1)
				return result[0];
			return result;
		}
		return null;
	}
}