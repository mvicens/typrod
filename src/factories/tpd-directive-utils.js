angular
	.module('tpd')
	.factory('tpdDirectiveUtils', tpdDirectiveUtils);

function tpdDirectiveUtils(tpdGetStr) {
	return {
		getPropDirectiveDefinitionObj: getPropDirectiveDefinitionObj,
		getInputDirectiveDefinitionObj: getInputDirectiveDefinitionObj
	};

	function getPropDirectiveDefinitionObj($compile, callback) {
		return {
			restrict: 'A',
			link: link
		};

		function link(scope, element) {
			var ec = scope.$$tpdEc;
			if (ec) {
				element = $(element);
				ec = tpdGetStr(ec[scope.$tpdProp.type], element.closest('[tpd-data]').get(0));
				if (ec) {
					(callback || angular.noop)(element);
					element.replaceWith($compile(ec)(scope));
				}
			}
		}
	}

	function getInputDirectiveDefinitionObj(linkFn) {
		return {
			restrict: 'E',
			link: linkFn,
			priority: 601 // To avoid previous execution of directive "ngIf"
		};
	}
}