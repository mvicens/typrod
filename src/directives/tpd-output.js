angular
	.module('tpd')
	.directive('tpdOutput', tpdOutput);

function tpdOutput(tpdDirectiveUtils, tpdUtils, tpdRegisterUtils, $compile) {
	return tpdDirectiveUtils.getForIo(function link(scope, element, attrs) {
		var output = tpdUtils.getTypeByProp(scope.$tpdProp).output;
		output = tpdRegisterUtils.toString(output, angular.copy(scope.$tpdProp));
		element.replaceWith($compile($(output).attr(tpdUtils.getAttrs(attrs)))(scope)); // JqLite
	});
}