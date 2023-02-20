angular
	.module('app')
	.config(config);

function config(tpdProvider) {
	tpdProvider
		.type('options', function (opts) {
			opts.fromJson = function (v) {
				return (v || '').split(',');
			};
			opts.toJson = function (v) {
				return (v || []).join();
			};
			return opts;
		})
		.type('year', ['number', function (opts) {
			delete opts.output;
			return opts;
		}])
		.type('boolean', function (opts) {
			opts.toJson = function (v) {
				return +v;
			};
			opts.output[3] = ' | answer';
			return opts;
		});

	var TPD_ROW_VALUES_VAR = '$tpdRowValues',
		HTML = '<tpd-input ng-if="' + TPD_ROW_VALUES_VAR + '.$$isEditing"></tpd-input><tpd-output ng-if="!' + TPD_ROW_VALUES_VAR + '.$$isEditing" />';
	tpdProvider
		.component('form', function (content) {
			return overwrite(content, {
				0: function (arr) {
					return overwrite(arr, {
						1: function (arr) {
							return overwrite(arr, undefined, undefined, [3]);
						}
					});
				},
				1: function (arr) {
					return overwrite(arr, {
						1: 'Filter'
					});
				}
			});
		})
		.component('tbody > tr', function (content) {
			return overwrite(content, { 1: HTML }, {
				3: '<td>',
				4: '<button type="button" ng-click="vm.toggleEdit(' + TPD_ROW_VALUES_VAR + ')">{{' + TPD_ROW_VALUES_VAR + '.$$isEditing?\'Save\':\'Edit\'}}</button>',
				5: '</td>'
			});
		}, function (ec) {
			return {
				number: overwrite(ec.number, {
					3: HTML
				})
			};
		});

	function overwrite(array, replacements, addings, removings) {
		angular.forEach(replacements, function (v, i) {
			if (angular.isFunction(v))
				v = v(array[i]);
			array[i] = v;
		});

		var n = 0;
		angular.forEach(addings, function (str, i) {
			i -= -n;
			array = array.slice(0, i).concat(str, array.slice(i));
			n++;
		});

		n = 0;
		angular.forEach(removings, function (i) {
			i -= n;
			array = array.slice(0, i).concat(array.slice(i + 1));
			n++;
		});

		return array;
	}
}