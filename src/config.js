(function () {
	var _DatetoJSON = Date.prototype.toJSON;

	angular
		.module('tpd')
		.config(config);

	function config($tpdProvider, $translateProvider) {
		var COLOR_INPUT_HTML = '<input type="color">',
			OUTPUT_HTML = '<tpd-output />',
			SEP = 'T';
		$tpdProvider
			.type(['string', 's', 'str'], {
				input: '<input type="text">'
			})
			.type('search', {
				input: '<input type="search">'
			})
			.type(['password', 'p', 'pw'], {
				fromJson: function (v) {
					if (v == null)
						return v;
					return String(v);
				},
				input: '<input type="password">',
				output: '{{$property.value | tpdPassword}}'
			})
			.type(['number', 'n', 'num'], {
				input: '<input type="number">',
				output: '{{$property.value | number}}'
			})
			.type(['range', 'r'], ['number', function (opts) {
				opts.input = '<input type="range">';
				opts.output += '%';
				return opts;
			}])
			.type(['boolean', 'b', 'bool'], {
				fromJson: function (v) {
					return !!v;
				},
				input: '<input type="checkbox">',
				output: '{{$property.value?\'✓\':\'✗\'}}'
			})
			.type(['date', 'd'], {
				fromJson: getFromJsonFn(),
				toJson: getToJsonFn(0),
				input: '<input type="date">',
				output: '{{$property.value | date}}' // "mediumDate"
			})
			.type(['time', 't'], {
				fromJson: getFromJsonFn(true),
				toJson: getToJsonFn(1),
				input: '<input type="time">',
				output: '{{$property.value | date:\'mediumTime\'}}'
			})
			.type(['datetime', 'dt'], ['date', function (opts) {
				delete opts.toJson;
				opts.input = '<input type="datetime-local">';
				opts.output = '{{$property.value | date:\'medium\'}}';
				return opts;
			}])
			.type(['option', 'o', 'opt'], {
				input: '<select ng-options="item.id as item.label for item in {{$property.options}}"></select>',
				output: function (scope) {
					return '{{$property.value | tpdOption:' + scope.$property.options + '}}';
				}
			})
			.type(['options', 'oo', 'opts'], ['option', function (opts) {
				opts.input = opts.input.replace('><', ' multiple><');
				opts.output = function (scope) {
					return '<ul><li ng-repeat="str in $property.value | tpdOptions:' + scope.$property.options + '">{{str}}</li></ul>';
				};
				return opts;
			}])
			.type(['color', 'c'], {
				input: COLOR_INPUT_HTML,
				output: COLOR_INPUT_HTML.replace('>', ' ng-model="$property.value" disabled>')
			})
			.type(['url', 'u'], {
				input: '<input type="url">',
				output: '<a ng-href="{{$property.value}}" target="_blank">{{$property.value}}</a>'
			})
			.type(['email', 'e', 'em'], ['url', function (opts) {
				return getOpts(opts, 'email', 'mailto');
			}])
			.type(['tel', 't'], ['url', function (opts) {
				return getOpts(opts, 'tel');
			}])
			.component('form', function (elem) {
				var NAME = elem.prop('dataset').name,
					ATTR = (NAME ? NAME + '.' : '') + '{{$property.name}}';
				return '<div tpd-property><label ng-attr-for="' + ATTR + '" tpd-label></label><tpd-input ng-attr-id="' + ATTR + '" /></div><button type="submit" translate="submit"></button>';
			}, {
				boolean: '<div><label><tpd-input></tpd-input> <span tpd-label></span></label></div>'
			})
			.component('dl', '<dt tpd-property-start tpd-label></dt><dd tpd-property-end>' + OUTPUT_HTML + '</dd>')
			.component('table', function (elem) {
				var attr = 'tpd-data',
					STR = 'values';
				attr += '="' + elem.attr(attr) + '"';
				return '<thead ' + attr + '></thead>' +
					'<tbody><tr ng-repeat="' + STR + ' in ' + elem.prop('dataset').expression + '" ' + attr + ' tpd-values="' + STR + '"></tr></tbody>';
			})
			.component('thead, tfoot', '<tr><th scope="col" tpd-property tpd-label></th></tr>')
			.component('tbody > tr', '<td tpd-property>' + OUTPUT_HTML + '</td>', {
				number: '<td style="text-align: right;">' + OUTPUT_HTML + '</td>'
			});

		var LANG_CODE = 'en';
		$translateProvider.translations(LANG_CODE, { submit: 'Submit' });
		$translateProvider.preferredLanguage(LANG_CODE);

		function getFromJsonFn(concatDate) {
			return function (v) {
				return v && new Date(
					(concatDate ? getDateStrPortion(new Date, 0) + SEP : '') +
					v +
					(concatDate ? 'Z' : '')
				);
			};
		}

		function getToJsonFn(i) {
			return function (v) {
				if (v) {
					var str = getDateStrPortion(v, i);
					if (i == 1)
						str = str.slice(0, -1); // Removes "Z"
					return str;
				}
			};
		}

		function getOpts(opts, type, protocol) {
			opts.input = '<input type="' + type + '">';
			opts.output = opts.output.replace(' target="_blank">', '>').replace('"', '"' + (protocol || type) + ':');
			return opts;
		}

		function getDateStrPortion(date, i) {
			return _DatetoJSON.call(date).split(SEP)[i];
		}
	}
})();