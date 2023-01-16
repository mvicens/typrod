angular
	.module('tpd')
	.directive('tpdOutput', tpdOutput);

function tpdOutput(tpdDirectiveUtils, tpdUtils, $compile) {
	return tpdDirectiveUtils.getInputDirectiveDefinitionObj(function link(scope, element, attrs) {
		var output = tpdUtils.getTypeByProp(scope.$tpdProp).output;
		if (angular.isFunction(output))
			output = output(scope);
		element.replaceWith($compile($('<span>' + output + '</span>').attr(tpdUtils.getAttrs(attrs)))(scope)); // JqLite
	});
}