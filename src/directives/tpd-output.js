angular
	.module('tpd')
	.directive('tpdOutput', tpdOutput);

function tpdOutput(tpdDirectiveUtils, tpdUtils, tpdRegisterUtils, $compile) {
	return tpdDirectiveUtils.getInputDirectiveDefinitionObj(function link(scope, element, attrs) {
		var output = tpdUtils.getTypeByProp(scope.$tpdProp).output;
		output = tpdRegisterUtils.toString(output, scope, true);
		element.replaceWith($compile($(output).attr(tpdUtils.getAttrs(attrs)))(scope)); // JqLite
	});
}