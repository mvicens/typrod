angular
	.module('tpd')
	.factory('tpdDirectiveUtils', tpdDirectiveUtils);

function tpdDirectiveUtils(tpdRegisterUtils) {
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
				ec = ec[scope.$tpdProp.type];
				if (ec) {
					element = $(element);
					ec = tpdRegisterUtils.toString(ec, element.closest('[tpd-data]').get(0));
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