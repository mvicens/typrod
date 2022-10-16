const $ = require('jquery');
window.jQuery = $; // To set it as alias of "angular.element"
require('angular');

const Chance = require('chance'),
	chance = new Chance();

(function () {
	angular
		.module('app', [require('../index'), 'pascalprecht.translate'])
		.config(config) // 1. Settings
		.filter('answer', answer)
		.controller('AppController', AppController)
		.config(translateConfig) // Translations
		.factory('fakeHttp', fakeHttp) // Simulates HTTP request
		.factory('getStrDate', getStrDate);

	function config($tpdProvider) {
		// 1.1. TPD types
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

		// 1.2. TPD components
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

	function answer(translateFilter) {
		return function (bool) {
			return translateFilter(bool ? 'yes' : 'no');
		};
	}

	function AppController(fakeHttp) {
		var vm = this;
		vm.filter = { // 2. Attribute contents
			data: [ // 2.2. TPD data
				{
					name: 'name',
					label: 'name'
				},
				{
					type: 'oo',
					name: 'gender',
					label: 'gender',
					options: 'vm.genders',
					required: true
				},
				{
					type: 'y',
					name: 'year',
					label: 'year'
				},
				{
					type: 'n',
					name: 'maxWeight',
					label: 'maxWeight',
					required: true
				},
				{
					type: 'email',
					name: 'email',
					label: 'email'
				},
				{
					type: 'b',
					name: 'isForeign',
					label: 'foreign?'
				}
			],
			values: {} // 2.1. Captured values
		};
		vm.genders = [];
		vm.limits = {};
		vm.doFilter = doFilter;
		vm.list = { // 2. Attribute contents
			data: [], // 2.2. TPD data
			values: {} // 2.1. Captured values
		};
		vm.toggleEdit = toggleEdit;

		activate();

		function activate() {
			vm.filter.values = fakeHttp.get('filter');
			angular.forEach(fakeHttp.get('genders'), function (label, code) {
				vm.genders.push({
					id: code,
					label: label
				});
			});
			vm.limits = fakeHttp.get('limits');

			var fd = angular.copy(vm.filter.data);
			fd[1].type = 'o';
			fd[2] = {
				type: 'date',
				name: 'birthdate',
				label: 'birthdate'
			};
			angular.forEach(['name', 'label'], function (prop) {
				fd[3][prop] = 'weight';
			});
			angular.forEach(fd, function (property) {
				delete property.required;
			});
			vm.list.data = fd;

			doFilter();
		}

		function doFilter() {
			vm.list.values = fakeHttp.get('list', vm.filter.values);
		}

		function toggleEdit(item) {
			item.$$isEditing = !item.$$isEditing;
			if (!item.$$isEditing)
				fakeHttp.post('item', item);
		}
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

	function fakeHttp(getStrDate, filterFilter) {
		var GENDERS = { m: 'Male', f: 'Female' },
			GENDERS_LIST = [],
			LAST_YEAR = (new Date()).getFullYear() - 1,
			MIN_YEAR = LAST_YEAR - 80,
			MIN_WEIGHT = 10,
			MAX_WEIGHT = 100;
		angular.forEach(GENDERS, function (label, code) {
			GENDERS_LIST.push(code);
		});

		var LIST = [],
			n = 1;
		for (var i = 0; i < 10; i++)
			LIST.push({
				id: n++,
				name: chance.name(),
				gender: GENDERS_LIST[+chance.bool()],
				birthdate: getStrDate(chance.date({ year: chance.year({ min: MIN_YEAR, max: LAST_YEAR }) })),
				weight: chance.floating({ min: MIN_WEIGHT, max: MAX_WEIGHT, fixed: 2 }),
				email: chance.email(),
				isForeign: +chance.bool()
			});

		return {
			get: get,
			post: post
		};

		function get(url, params) {
			switch (url) {
				case 'filter':
					return {
						name: '',
						gender: GENDERS_LIST.join(),
						year: null,
						maxWeight: MAX_WEIGHT,
						email: '',
						isForeign: 0
					};
				case 'genders':
					return GENDERS;
				case 'limits':
					return {
						year: { min: MIN_YEAR, max: LAST_YEAR },
						weight: { min: MIN_WEIGHT, max: MAX_WEIGHT }
					};
				case 'list':
					return filterFilter(filterFilter(angular.copy(LIST), {
						name: params.name,
						email: params.email
					}), function (item) {
						var isMatched = false;
						angular.forEach(params.gender.split(','), function (code) {
							if (code == item.gender)
								isMatched = true;
						});
						if (!isMatched)
							return false;

						var py = params.year;
						if (py && (new Date(item.birthdate)).getFullYear() != py)
							return false;

						var iw = item.weight,
							pmw = params.maxWeight;
						if (iw > pmw)
							return false;

						return item.isForeign == params.isForeign;
					});
			}
		}

		function post(url, params) {
			if (url == 'item') {
				var id = params.id;
				angular.forEach(LIST, function (item, i, list) {
					if (item.id == params.id)
						list[i] = params;
				});
			}
		}
	}

	function getStrDate() {
		return function (date) {
			return date.toISOString().split('T')[0];
		};
	}
})();