angular
	.module('app')
	.config(config);

function config(tpdProvider) {
	tpdProvider
		.type('*', function (opts) {
			var input = $(opts.input);
			if (input.prop('type') == 'checkbox')
				input.addClass('form-check-input');
			else
				input.addClass('form-control');
			opts.input = input.get(0);
			return opts;
		})
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

	var TPD_VALUES_VAR = '$tpdValues',
		HTML = '<tpd-input ng-if="' + TPD_VALUES_VAR + '.$$isEditing"></tpd-input><tpd-output ng-if="!' + TPD_VALUES_VAR + '.$$isEditing" />';
	tpdProvider
		.component('form', function (content) {
			return overwrite(content, {
				0: ['<div', '<div class="row mb-3"'],
				1: ['<label', '<label class="col-sm-2 col-form-label"'],
				10: ['<button', '<button class="btn btn-primary"'],
				11: 'Filter'
			}, {
				6: '<div class="col-sm-10">',
				9: '</div>'
			}, [4]);
		}, function (ec) {
			return {
				boolean: overwrite(ec.boolean, {
					1: ['<label', '<label class="form-check mb-3"'],
					2: ['<tpd-input', '<tpd-input class="form-check-input"'],
					4: ['<span', '<span class="form-check-label"']
				}, undefined, [0, 6])
			};
		})
		.component('thead, tfoot', function (content) {
			return overwrite(content, undefined, { 4: '<th></th>' });
		})
		.component('tbody > tr', function (content) {
			return overwrite(content, { 1: HTML }, {
				3: '<td>',
				4: '<button type="button" class="btn" ng-class="\'btn-\'+(' + TPD_VALUES_VAR + '.$$isEditing?\'primary\':\'secondary\')" ng-click="vm.toggleEdit(' + TPD_VALUES_VAR + ')">{{' + TPD_VALUES_VAR + '.$$isEditing?\'Save\':\'Edit\'}}</button>',
				5: '</td>'
			});
		}, function (ec) {
			return {
				number: overwrite(ec.number, {
					1: ' class="text-end"',
					3: HTML
				})
			};
		});

	function overwrite(array, replacements, addings, removings) {
		angular.forEach(replacements, function (str, i) {
			if (angular.isArray(str))
				str = array[i].replace(str[0], str[1]);
			array[i] = str;
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