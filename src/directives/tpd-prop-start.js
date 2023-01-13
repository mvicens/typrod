angular
	.module('tpd')
	.directive('tpdPropStart', tpdPropStart);

function tpdPropStart(tpdDirectiveUtils, $compile) {
	return tpdDirectiveUtils.getPropDirectiveDefinitionObj($compile, function (element) {
		$(element)
			.nextUntil('[tpd-prop-end]')
			.next()
				.remove()
			.end()
			.remove();
	});
}