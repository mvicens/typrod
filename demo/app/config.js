angular
	.module('app')
	.config(config)
	.config(translateConfig); // Translations

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
		.type(['year', 'y'], ['number', function (opts) {
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

	var html = '<tpd-input ng-if="values.$$isEditing"></tpd-input><tpd-output ng-if="!values.$$isEditing" />';
	$tpdProvider
		.component('form', function () {
			var attr = '{{$property.name}}';
			return '<div class="row mb-3" tpd-property><label class="col-sm-2 col-form-label" ng-attr-for="' + attr + '" tpd-label></label><div class="col-sm-10"><tpd-input ng-attr-id="' + attr + '" /></div></div><button type="submit" class="btn btn-primary" translate="filter"></button>';
		}, {
			boolean: '<label class="form-check mb-3"><tpd-input class="form-check-input"></tpd-input> <span class="form-check-label" tpd-label></span></label>'
		})
		.component('thead, tfoot', '<tr><th scope="col" tpd-property tpd-label></th><th></th></tr>')
		.component('tbody > tr', '<td tpd-property>' + html + '</td><td><button type="button" class="btn" ng-class="\'btn-\'+(values.$$isEditing?\'primary\':\'secondary\')" ng-click="vm.toggleEdit(values)" translate="{{values.$$isEditing?\'save\':\'edit\'}}"></button></td>', {
			number: '<td class="text-end">' + html + '</td>'
		});
}

function translateConfig($translateProvider) {
	var LANG_CODE = 'en';
	$translateProvider
		.translations(LANG_CODE, {
			name: 'Name',
			gender: 'Gender',
			year: 'Year',
			maxWeight: 'Max. weight (kg)',
			email: 'E-mail',
			'foreign?': 'Foreign?',
			filter: 'Filter',
			birthdate: 'Birthdate',
			weight: 'Weight (kg)',
			yes: 'Yes',
			no: 'No',
			edit: 'Edit',
			save: 'Save'
		})
		.preferredLanguage(LANG_CODE)
		.useSanitizeValueStrategy(null);
}