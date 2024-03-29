angular
	.module('tpd')
	.directive('tpdInput', tpdInput);

function tpdInput(tpdDirectiveUtils, tpdUtils, tpdRegisterUtils, $compile) {
	return tpdDirectiveUtils.getForIo(function link(scope, element, attrs) {
		var input = tpdUtils.getTypeByProp(scope.$tpdProp).input;
		input = tpdRegisterUtils.toString(input, angular.copy(scope.$tpdProp));

		input = $(input);
		var targetElem = input.find('[tpd-target]'),
			propStr = '$tpdProp';
		input.attr(tpdUtils.getAttrs(attrs));
		(targetElem.length ? targetElem : input).attr({
			'ng-model': '$tpdValue',
			'ng-required': propStr + '.required',
			'ng-attr-min': '{{' + propStr + '.min}}',
			'ng-attr-max': '{{' + propStr + '.max}}'
		});
		element.replaceWith($compile(input)(scope)); // JqLite
	});
}