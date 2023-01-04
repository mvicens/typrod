angular
	.module('app')
	.config(config);

function config($tpdProvider) {
	$tpdProvider
		.type('*', function (opts) {
			var input = $(opts.input);
			if (input.prop('type') == 'checkbox')
				input.addClass('form-check-input');
			else
				input.addClass('form-control');
			opts.input = input;
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
			opts.output = opts.output.split('?')[0] + ' | answer}}';
			return opts;
		});

	var HTML = '<tpd-input ng-if="values.$$isEditing"></tpd-input><tpd-output ng-if="!values.$$isEditing" />';
	$tpdProvider
		.component('form', function (content) {
			return overwrite(content, {
				0: ['<div', '<div class="row mb-3"'],
				1: ['<label', '<label class="col-sm-2 col-form-label"'],
				3: [' ng-if="$tpdProp.label"', ''],
				8: ['<button', '<button class="btn btn-primary"'],
				9: 'Filter'
			}, {
				4: '<div class="col-sm-10">',
				7: '</div>'
			});
		}, function (ec) {
			return {
				boolean: overwrite(ec.boolean, {
					1: ['<label', '<label class="form-check mb-3"'],
					2: ['<tpd-input', '<tpd-input class="form-check-input"'],
					4: ['<span', '<span class="form-check-label"']
				}, [0, 6])
			};
		})
		.component('thead, tfoot', function (content) {
			return overwrite(content, undefined, { 2: '<th></th>' });
		})
		.component('tbody > tr', function (content) {
			return overwrite(content, { 1: HTML }, {
				3: '<td>',
				4: '<button type="button" class="btn" ng-class="\'btn-\'+(values.$$isEditing?\'primary\':\'secondary\')" ng-click="vm.toggleEdit(values)">{{values.$$isEditing?\'Save\':\'Edit\'}}</button>',
				5: '</td>'
			});
		}, function (ec) {
			return {
				number: overwrite(ec.number, {
					0: ['style="text-align: right;"', 'class="text-end"'],
					1: HTML
				})
			};
		});

	function overwrite(array, replacements, addingsOrRemovings) {
		angular.forEach(replacements, function (str, i) {
			if (angular.isArray(str))
				str = array[i].replace(str[0], str[1]);
			array[i] = str;
		});

		var n = 0;
		if (angular.isArray(addingsOrRemovings))
			angular.forEach(addingsOrRemovings, function (i) {
				i -= n;
				array = array.slice(0, i).concat(array.slice(i + 1));
				n++;
			});
		else
			angular.forEach(addingsOrRemovings, function (str, i) {
				i -= -n;
				array = array.slice(0, i).concat(str, array.slice(i));
				n++;
			});

		return array;
	}
}