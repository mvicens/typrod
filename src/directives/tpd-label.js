angular
	.module('tpd')
	.directive('tpdLabel', tpdLabel);

function tpdLabel() {
	return {
		restrict: 'A',
		template: template
	};

	function template() {
		return '<span ng-bind-html="$tpdProp.label"></span>';
	}
}