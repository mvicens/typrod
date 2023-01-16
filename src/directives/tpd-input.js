angular
	.module('tpd')
	.directive('tpdInput', tpdInput);

function tpdInput(tpdDirectiveUtils, tpdUtils, tpdToString, $compile) {
	return tpdDirectiveUtils.getInputDirectiveDefinitionObj(function link(scope, element, attrs) {
		var input = tpdUtils.getTypeByProp(scope.$tpdProp).input;
		input = tpdToString(input, scope, true);

		input = $(input);
		var targetElem = input.find('[tpd-target]'),
			propStr = '$tpdProp';
		input.attr(tpdUtils.getAttrs(attrs));
		(targetElem.length ? targetElem : input).attr({
			'ng-model': propStr + '.value',
			'ng-required': propStr + '.required',
			'ng-attr-min': '{{' + propStr + '.min}}',
			'ng-attr-max': '{{' + propStr + '.max}}'
		});
		element.replaceWith($compile(input)(scope)); // JqLite
	});
}