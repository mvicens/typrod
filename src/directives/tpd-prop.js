angular
	.module('tpd')
	.directive('tpdProp', tpdProp);

function tpdProp(tpdDirectiveUtils, $compile) {
	return tpdDirectiveUtils.getForProp($compile);
}