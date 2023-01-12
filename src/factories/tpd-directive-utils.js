angular
	.module('tpd')
	.factory('tpdDirectiveUtils', tpdDirectiveUtils);

function tpdDirectiveUtils(tpdUtils) {
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
				ec = tpdUtils.getStr(ec[scope.$tpdProp.type], element.closest('[tpd-data]'));
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