angular
	.module('tpd')
	.directive('tpdPropStart', tpdPropStart);

function tpdPropStart(tpdDirectiveUtils, $compile) {
	return tpdDirectiveUtils.getForProp($compile, function (element) {
		$(element)
			.nextUntil('[tpd-prop-end]')
			.next()
				.remove()
			.end()
			.remove();
	});
}