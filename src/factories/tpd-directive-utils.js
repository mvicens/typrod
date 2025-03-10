angular
	.module('tpd')
	.factory('tpdDirectiveUtils', tpdDirectiveUtils);

function tpdDirectiveUtils(tpdMaximumDirectivePriority, tpdRegisterUtils) { // Getter of dir. definition objects
	return {
		getForProp: getForProp,
		getForIo: getForIo // IO: input/output
	};

	function getForProp($compile, callback) {
		return {
			restrict: 'A',
			link: link,
			priority: 900 // Between 600 ("ngIf") and 999 (less than "ngRepeat")
		};

		function link(scope, element) {
			if (scope.$tpdValues) {
				scope.$watch('$tpdValues[$tpdProp.name]', function (value) {
					scope.$tpdValue = value;
				});
				var NAME = scope.$tpdProp.name;
				scope.$watch('$tpdValue', function (value) {
					scope.$tpdValues[NAME] = value;
				});
			}

			var ec = scope.$$tpdEc;
			if (ec) {
				ec = ec[scope.$tpdProp.type];
				if (ec) {
					element = $(element);
					ec = tpdRegisterUtils.toString(ec, angular.copy(element.closest('[tpd-data]').get(0)));
					(callback || angular.noop)(element);
					element.replaceWith($compile(ec)(scope));
				}
			}
		}
	}

	function getForIo(linkFn) {
		return {
			restrict: 'E',
			link: linkFn,
			priority: tpdMaximumDirectivePriority
		};
	}
}