angular
	.module('tpd')
	.config(config);

function config(dateFilterProvider, tpdProvider) {
	var dateFilter = dateFilterProvider.$get(),
		COLOR_INPUT_HTML = '<input type="color">',
		IF_LABEL_ATTR = ' ng-if="$tpdProp.label"',
		OUTPUT_HTML = '<tpd-output />',
		TPD_ROW_VALUES_VAR = '$tpdRowValues';
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
		.type('date', getDateOpts('date',
			'date', // "mediumDate"
			getJsonDatePortion))
		.type('time', getDateOpts('time', 'date:\'mediumTime\'', function (date) {
			return getJsonDatePortion(date, true);
		}, function (v) {
			return getJsonDatePortion(new Date) + 'T' + v + 'Z';
		}))
		.type('datetime', getDateOpts('datetime-local', 'date:\'medium\'')) // Implicit call to "toJSON"
		.type('week', getDateOpts('week', 'date:\'w, y\'', function (date) {
			return dateFilter(date, "yyyy-'W'ww");
		}, function (v) {
			v = v.split('-W');
			var YEAR = v[0],
				weekday = new Date(YEAR, 0, 1).getDay(),
				THURSDAY = 4,
				WEEKDAYS_AMOUNT = 7;
			if (weekday > THURSDAY)
				weekday -= WEEKDAYS_AMOUNT;
			v = new Date(YEAR, 0, 1 + THURSDAY - weekday + (v[1] - 1) * WEEKDAYS_AMOUNT);
			if (!isNaN(v)) // Not invalid date
				return v.toJSON();
		}))
		.type('month', getDateOpts('month', 'date:\'MMM, y\'', function (date) {
			return getJsonDatePortion(date).slice(0, -3);
		}))
		.type('option', getOptionsOpts(function ($tpdProp) {
			return getOutput(' | tpdOption:' + $tpdProp.options);
		}))
		.type('options', getOptionsOpts(function ($tpdProp) {
			return '<ul><li ng-repeat="str in $tpdValue | tpdOptions:' + $tpdProp.options + '">{{str}}</li></ul>';
		}, 'multiple'))
		.type('color', {
			input: COLOR_INPUT_HTML,
			output: COLOR_INPUT_HTML.replace('>', ' ng-model="$tpdValue" disabled>')
		})
		.type('url', getLinkOpts('url'))
		.type('email', getLinkOpts('email', 'mailto'))
		.type('tel', getLinkOpts('tel', 'tel'))
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
				['<tr ng-repeat="' + TPD_ROW_VALUES_VAR + ' in ', getTpdValuesArray, '"', ' ', getTpdDataAttr, ' tpd-values="' + TPD_ROW_VALUES_VAR + '"></tr>'],
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

	function toString(v) {
		if (v == null)
			return v;
		return String(v);
	}

	function getOutput(str) {
		return ['<span>', '{{', '$tpdValue', str, '}}', '</span>'];
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

	function getDateOpts(inputType, outputFilter, toJsonFn, fromJsonFn) {
		var opts = {
			fromJson: function toDate(v) {
				if (_.isString(v) && v) {
					if (fromJsonFn)
						v = fromJsonFn(v);
					v = new Date(v);
					if (!isNaN(v))
						return v;
				}
			},
			input: '<input type="' + inputType + '">',
			output: getOutput(' | ' + outputFilter)
		};
		if (toJsonFn)
			opts.toJson = function toJsonDate(v) {
				if (v)
					return toJsonFn(v);
			};
		return opts;
	}

	function getJsonDatePortion(date, isTime) {
		var str = date.toJSON().split('T')[isTime ? 1 : 0];
		if (isTime)
			str = str.slice(0, -1); // Removes "Z"
		return str;
	}

	function getOptionsOpts(outputFn, attr) {
		return {
			input: '<select ng-options="item.id as item.label for item in {{$tpdProp.options}}"' + (attr ? ' ' + attr : '') + '></select>',
			output: outputFn
		};
	}

	function getLinkOpts(type, protocol) {
		var TPD_PROP_VALUE = '{{$tpdValue}}',
			output = ['<a', ' ng-href="' + (protocol ? protocol + ':' : '') + TPD_PROP_VALUE + '"'];
		if (!protocol)
			output.push(' target="_blank"');
		output.push('>', TPD_PROP_VALUE, '</a>');
		return {
			input: '<input type="' + type + '">',
			output: output
		};
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
}