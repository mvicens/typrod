angular
	.module('tpd')
	.directive('tpdData', tpdDataCompile)
	.directive('tpdData', tpdDataLink); // To get scope of "ngRepeat"

function tpdDataCompile(tpd, tpdMaximumDirectivePriority, tpdRegisterUtils) {
	return {
		restrict: 'A',
		compile: compile,
		priority: tpdMaximumDirectivePriority
	};

	function compile(element) {
		var component = getComponentByElem(tpd, element);
		if (!component) {
			tpdRegisterUtils.showError('CNM');
			return;
		}

		element = $(element);

		var content = component[0];
		content = tpdRegisterUtils.toString(content, angular.copy(element.get(0)));

		var ATTR_CONTENT = '$tpdProp in $$tpdData';
		element.html(
			$('<div>')
				.html(content)
				.find('[tpd-prop]')
					.attr('ng-repeat', ATTR_CONTENT)
				.end()
				.find('[tpd-prop-start]')
					.attr('ng-repeat-start', ATTR_CONTENT)
				.end()
				.find('[tpd-prop-end]')
					.attr('ng-repeat-end', '')
				.end()
				.html()
		);
	}
}

function tpdDataLink(tpd, $sce, tpdUtils, tpdRegisterUtils) {
	return {
		restrict: 'A',
		scope: true,
		link: link
	};

	function link(scope, element, attrs) {
		var component = getComponentByElem(tpd, element);
		if (!component)
			return; // Error is shown before

		var data = angular.copy(scope.$eval(attrs[this.name])),
			jsonValues = scope.$eval(attrs.tpdValues),
			formattedValues = jsonValues ? {} : undefined;
		angular.forEach(data, function (property, i) {
			if (angular.isArray(property)) {
				var keys = ['name', 'label', 'required', 'type'],
					obj = {};
				angular.forEach(keys, function (key, j) {
					obj[key] = property[j];
				});
				data[i] = property = angular.merge(obj, property[keys.length]);
			}

			property.type = property.type || 'string';

			var type = tpdUtils.getTypeByProp(property);
			if (!type) {
				tpdRegisterUtils.showError('PRT', property.type);
				data[i] = null;
				return;
			}

			property.label = $sce.trustAsHtml(property.label);
			if (jsonValues) {
				var NAME = property.name;
				scope.$watch(function () {
					return jsonValues[NAME];
				}, function (value) {
					formattedValues[NAME] = type.fromJson(value);
				});
				scope.$watch(function () {
					return formattedValues[NAME];
				}, function (value) {
					jsonValues[NAME] = type.toJson(value);
				});
			}
		});
		_.remove(data, function (property) { return !property; });
		scope.$$tpdData = data;
		scope.$tpdValues = formattedValues;

		scope.$$tpdEc = component[1];
	}
}

function getComponentByElem(tpd, elem) {
	var matches = [];

	elem = $(elem);
	angular.forEach(tpd.components(), function (component) {
		var selector = component.selector;
		if (elem.is(selector))
			matches.push({
				selector: selector,
				args: [component.content, component.ec]
			});
	});

	if (matches.length == 1)
		return matches[0].args;

	var selector,
		args;
	angular.forEach(matches, function (match) {
		if (!selector || SPECIFICITY.compare(selector, match.selector) < 0) {
			selector = match.selector;
			args = match.args;
		}
	});
	return args;
}