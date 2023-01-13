angular
	.module('tpd')
	.factory('tpdUtils', tpdUtils);

function tpdUtils($tpd) {
	return {
		getTypeByProp: getTypeByProp,
		getComponentByElem: getComponentByElem,
		getStr: getStr,
		getAttrs: getAttrs
	};

	function getTypeByProp(prop) {
		return $tpd.types()[prop.type];
	}

	function getComponentByElem(selection) {
		var matches = [];

		selection = $(selection);
		angular.forEach($tpd.components(), function (component) {
			var selector = component.selector;
			if (selection.is(selector))
				matches.push({
					selector: selector,
					opts: [component.content, component.ec]
				});
		});

		if (matches.length == 1)
			return matches[0].opts;

		var selector,
			opts;
		angular.forEach(matches, function (match) {
			if (!selector || SPECIFICITY.compare(selector, match.selector) < 0) {
				selector = match.selector;
				opts = match.opts;
			}
		});
		return opts;
	}

	function getStr(v, arg, hasElem) {
		if (angular.isString(v))
			return v;
		if (angular.isFunction(v))
			return v(arg);
		if (hasElem && angular.isElement(v))
			return $(v).appendTo('<div>').parent().html();
		if (angular.isArray(v)) { // Joining array
			var str = '';
			angular.forEach(v, function (v2, i) {
				str += getStr(v2, arg, hasElem);
			});
			return str;
		}
	}

	function getAttrs(attrs) {
		var elemAttrs = {};
		angular.forEach(attrs.$attr, function (name, normalizedName) {
			elemAttrs[name] = attrs[normalizedName];
		});
		return elemAttrs;
	}
}