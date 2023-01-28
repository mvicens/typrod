var _DatetoJSON = Date.prototype.toJSON;

angular
	.module('tpd')
	.config(config);

function config(tpdProvider) {
	var COLOR_INPUT_HTML = '<input type="color">',
		OUTPUT_HTML = '<tpd-output />',
		TPD_VALUES_VAR = '$tpdValues';
	tpdProvider
		.type('string', {
			input: '<input type="text">' // Default from now
		})
		.type('search', {
			input: '<input type="search">'
		})
		.type('password', {
			fromJson: function (v) {
				if (v == null)
					return v;
				return String(v);
			},
			input: '<input type="password">',
			output: getOutput(' | tpdPassword')
		})
		.type('text', {
			input: '<textarea ng-attr-rows="{{$tpdProp.rows}}"></textarea>'
		})
		.type('number', {
			input: '<input type="number">',
			output: getOutput(' | number')
		})
		.type('boolean', {
			fromJson: function (v) {
				return !!v;
			},
			input: '<input type="checkbox">',
			output: getOutput(' ? \'✓\' : \'✗\'')
		})
		.type(['date', 'datetime'], {
			fromJson: getFromJsonFn(),
			toJson: getToJsonFn(0),
			input: '<input type="date">',
			output: getOutput(' | date') // "mediumDate"
		})
		.type('time', {
			fromJson: getFromJsonFn(true),
			toJson: getToJsonFn(1),
			input: '<input type="time">',
			output: getOutput(' | date:\'mediumTime\'')
		})
		.type('datetime', function (opts) {
			delete opts.toJson;
			opts.input = opts.input.replace('date', 'datetime-local');
			opts.output[3] = ' | date:\'medium\'';
			return opts;
		})
		.type(['option', 'options'], {
			input: '<select ng-options="item.id as item.label for item in {{$tpdProp.options}}"></select>',
			output: function (scope) {
				return getOutput(' | tpdOption:' + scope.$tpdProp.options);
			}
		})
		.type('options', function (opts) {
			opts.input = opts.input.replace('><', ' multiple><');
			opts.output = function (scope) {
				return '<ul><li ng-repeat="str in $tpdProp.value | tpdOptions:' + scope.$tpdProp.options + '">{{str}}</li></ul>';
			};
			return opts;
		})
		.type('color', {
			input: COLOR_INPUT_HTML,
			output: COLOR_INPUT_HTML.replace('>', ' ng-model="$tpdProp.value" disabled>')
		})
		.type('url', {
			input: '<input type="url">',
			output: ['<a', ' ng-href="{{$tpdProp.value}}" target="_blank"', '>', '{{', '$tpdProp.value', '}}', '</a>']
		})
		.type('email', ['url', function (opts) {
			return getOpts(opts, 'email', 'mailto');
		}])
		.type('tel', ['url', function (opts) {
			return getOpts(opts, 'tel');
		}])
		.component('form', [
			[
				'<div tpd-prop>',
				['<label ng-attr-for="', getLabelableId, '"', ' ng-if="$tpdProp.label"', ' tpd-label></label>'],
				['<tpd-input ng-attr-id="', getLabelableId, '" />'],
				'</div>'
			],
			['<button>', 'Submit', '</button>']
		], {
			boolean: [
				'<div>',
				['<label>', '<tpd-input></tpd-input>', ' ', '<span tpd-label></span>', '</label>'],
				'</div>'
			]
		})
		.component('dl', [
			'<dt tpd-prop-start tpd-label></dt>',
			['<dd tpd-prop-end>', OUTPUT_HTML, '</dd>']
		])
		.component('table', [
			['<thead', ' ', getTpdDataAttr, '></thead>'],
			[
				'<tbody>',
				['<tr ng-repeat="' + TPD_VALUES_VAR + ' in ', getTpdValuesArray, '"', ' ', getTpdDataAttr, ' tpd-values="' + TPD_VALUES_VAR + '"></tr>'],
				'</tbody>'
			]
		])
		.component('thead, tfoot', [
			'<tr>',
			['<th', ' scope="col"', ' tpd-prop tpd-label></th>'],
			'</tr>'
		])
		.component('tbody > tr', ['<td tpd-prop>', OUTPUT_HTML, '</td>'], {
			number: ['<td', ' style="text-align: right;"', '>', OUTPUT_HTML, '</td>']
		})
		.type('range', ['number', function (opts) {
			opts.input = '<input type="range">';
			opts.output[4] = '}}%';
			return opts;
		}]);

	function getOutput(str) {
		return ['<span>', '{{', '$tpdProp.value', str, '}}', '</span>'];
	}

	function getFromJsonFn(concatDate) {
		return function getDatetime(v) {
			return v && new Date(
				(concatDate ? getDateStrPortion(new Date, 0) + 'T' : '') +
				v +
				(concatDate ? 'Z' : '')
			);
		};
	}

	function getToJsonFn(i) {
		return function getString(v) {
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
		opts.output[1] = opts.output[1].replace(' target="_blank"', '').replace('"', '"' + (protocol || type) + ':');
		return opts;
	}

	function getLabelableId(elem) {
		var NAME = $(elem).data('name');
		return (NAME ? NAME + '-' : '') + '{{$tpdProp.name}}';
	}

	function getTpdDataAttr(elem) {
		var ATTR = 'tpd-data';
		return ATTR + '="' + $(elem).attr(ATTR) + '"';
	}

	function getTpdValuesArray(elem) {
		return $(elem).data('tpdValues');
	}

	function getDateStrPortion(date, i) {
		return _DatetoJSON.call(date).split('T')[i];
	}
}