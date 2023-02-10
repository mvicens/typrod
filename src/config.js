var _DatetoJSON = Date.prototype.toJSON;

angular
	.module('tpd')
	.config(config);

function config(tpdProvider) {
	var COLOR_INPUT_HTML = '<input type="color">',
		IF_LABEL_ATTR = ' ng-if="$tpdProp.label"',
		OUTPUT_HTML = '<tpd-output />',
		TPD_VALUES_VAR = '$tpdValues';
	tpdProvider
		.type('string', {
			fromJson: toString,
			input: '<input type="text">' // Default from now
		})
		.type('search', {
			fromJson: toString,
			input: '<input type="search">'
		})
		.type('password', {
			fromJson: toString,
			input: '<input type="password">',
			output: getOutput(' | tpdPassword')
		})
		.type('text', {
			fromJson: toString,
			input: '<textarea ng-attr-rows="{{$tpdProp.rows}}"></textarea>'
		})
		.type('number', {
			fromJson: toNumber,
			input: '<input type="number">',
			output: getOutput(' | number')
		})
		.type('boolean', {
			fromJson: toBoolean,
			input: '<input type="checkbox">',
			output: getOutput(' ? \'✓\' : \'✗\'')
		})
		.type(['date', 'datetime', 'week', 'month'], {
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
		.type('week', function (opts) {
			opts.input = opts.input.replace('date', 'week');
			opts.output[3] = ' | date:\'w, y\'';
			return opts;
		})
		.type('month', function (opts) {
			opts.input = opts.input.replace('date', 'month');
			opts.output[3] = ' | date:\'MMM/y\'';
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
				['<label ng-attr-for="', getLabelableId, '"', IF_LABEL_ATTR, ' tpd-label></label>'],
				' ',
				['<tpd-input ng-attr-id="', getLabelableId, '" />'],
				'</div>'
			],
			['<button>', 'Submit', '</button>']
		], {
			boolean: [
				'<div>',
				[
					'<label>',
					'<tpd-input></tpd-input>',
					['<span', IF_LABEL_ATTR, '> </span>'],
					['<span', IF_LABEL_ATTR, ' tpd-label></span>'],
					'</label>'
				],
				'</div>'
			]
		})
		.component('dl', [
			['<dt', IF_LABEL_ATTR, ' tpd-prop-start tpd-label></dt>'],
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

	function toString(v) {
		if (v == null)
			return v;
		return String(v);
	}

	function toNumber(v) {
		if (v == null)
			return v;
		v = Number(v);
		if (!isNaN(v))
			return v;
	}

	function toBoolean(v) {
		return Boolean(v);
	}

	function getFromJsonFn(isTime) {
		return function toDate(v) {
			return v && new Date(
				(isTime ? getJsonDatePortion(new Date, 0) + 'T' : '') +
				v +
				(isTime ? 'Z' : '')
			);
		};
	}

	function getToJsonFn(i) {
		return function toJsonDate(v) {
			if (v)
				return getJsonDatePortion(v, i);
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

	function getJsonDatePortion(date, i) {
		var str = _DatetoJSON.call(date).split('T')[i];
		if (i == 1)
			str = str.slice(0, -1); // Removes "Z"
		return str;
	}
}