angular
	.module('tpd')
	.directive('tpdData', tpdDataCompile)
	.directive('tpdData', tpdDataLink); // To get scope of "ngRepeat"

function tpdDataCompile(tpdUtils) {
	return {
		restrict: 'A',
		compile: compile,
		priority: 1010 // Executed before directive "ngRepeat" and other custom ones
	};

	function compile(element) {
		var component = tpdUtils.getComponentByElem(element);
		if (!component)
			return;

		var content = component[0];
		content = tpdUtils.getStr(content, element);

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

function tpdDataLink(tpdUtils, $sce) {
	return {
		restrict: 'A',
		scope: true,
		link: link
	};

	function link(scope, element, attrs) {
		var component = tpdUtils.getComponentByElem(element);
		if (!component)
			return;

		var data = angular.copy(scope.$eval(attrs[this.name])),
			values = scope.$eval(attrs.tpdValues);
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
			property.label = $sce.trustAsHtml(property.label);
			if (values) {
				var NAME = property.name;
				scope.$watch(function () {
					return values[NAME];
				}, function (value) {
					property.value = tpdUtils.getTypeByProp(property).fromJson(value);
				});
				scope.$watch(function () {
					return property.value;
				}, function (value) {
					values[NAME] = tpdUtils.getTypeByProp(property).toJson(value);
				});
			}
		});
		scope.$$tpdData = data;

		scope.$$tpdEc = component[1];
	}
}