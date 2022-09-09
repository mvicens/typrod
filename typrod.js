(function () {
	var _DatetoJSON = Date.prototype.toJSON,
		registers = {
			types: {
				original: {},
				stored: {}
			},
			components: {},
			aliases: {
				listed: {},
				grouped: {}
			}
		};

	angular
		.module('tpd', ['pascalprecht.translate'])
		.provider('$tpd', $tpdProvider)
		.config(config)
		.directive('tpdData', tpdDataCompile)
		.directive('tpdData', tpdDataLink) // To get scope of "ngRepeat"
		.directive('tpdProperty', tpdProperty)
		.directive('tpdPropertyStart', tpdPropertyStart)
		.directive('tpdLabel', tpdLabel)
		.directive('tpdInput', tpdInput)
		.directive('tpdOutput', tpdOutput)
		.filter('tpdPassword', tpdPassword)
		.filter('tpdOption', tpdOption)
		.filter('tpdOptions', tpdOptions);

	function $tpdProvider() {
		var defOpts = {
			fromJson: angular.identity,
			toJson: function (v) {
				if (v && v.toJSON)
					return v.toJSON();
				return v;
			},
			input: undefined,
			output: '{{$property.value}}'
		};
		this.$get = $get;
		this.type = setType;
		this.component = setComponent;

		function $get() {
			return function () {
				var regs = {};
				angular.forEach(registers, function (reg, prop) {
					switch (prop) {
						case 'types':
							reg = reg.original;
							break;
						case 'aliases':
							reg = reg.grouped;
					}
					regs[prop] = angular.copy(reg);
				});
				return regs;
			};
		}

		function setType(name, opts) {
			var types = registers.types,
				original = types.original;

			if (name == '*') {
				angular.forEach(_.keys(original), function (name) {
					setType(name, opts);
				});
				return this;
			}

			var aliases = [];
			if (angular.isArray(name)) {
				aliases = name;
				name = aliases.shift();
			}

			var copiedType = name;
			if (angular.isArray(opts)) {
				copiedType = opts[0];
				opts = opts[1];
				angular.forEach(registers.components, function (opts) {
					var ec = opts[1];
					angular.forEach(ec, function (opt, typeName) {
						if (typeName == copiedType)
							ec[name] = opt;
					});
				});
			}
			if (angular.isFunction(opts))
				opts = opts(angular.copy(getType(copiedType, true)));

			var origOpts = angular.copy(opts);

			var strType = getType('string', true);
			defOpts.input = strType && strType.input;
			opts = opts || {};
			angular.forEach(defOpts, function (defOpt, prop) {
				opts[prop] = opts[prop] || defOpt;
			});

			original[name] = origOpts;
			types.stored[name] = opts;

			if (aliases.length) {
				var regs = registers.aliases;

				var listed = regs.listed;
				angular.forEach(aliases, function (alias) {
					listed[alias] = name;
				});

				regs.grouped[name] = aliases;
			}

			return this;
		}

		function setComponent(selector, content, ec) {
			var opts = [content];
			if (ec) // Exceptional containers
				opts.push(ec);
			registers.components[selector] = opts;

			return this;
		}
	}

	function config($tpdProvider, $translateProvider) {
		var colorInputHtml = '<input type="color">',
			outputHtml = '<tpd-output />',
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
				input: colorInputHtml,
				output: colorInputHtml.replace('>', ' ng-model="$property.value" disabled>')
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
				var name = elem.prop('dataset').name,
					attr = (name ? name + '.' : '') + '{{$property.name}}';
				return '<div tpd-property><label ng-attr-for="' + attr + '" tpd-label></label><tpd-input ng-attr-id="' + attr + '" /></div><button type="submit" translate="submit"></button>';
			}, {
				boolean: '<div><label><tpd-input></tpd-input> <span tpd-label></span></label></div>'
			})
			.component('dl', '<dt tpd-property-start tpd-label></dt><dd tpd-property-end>' + outputHtml + '</dd>')
			.component('table', function (elem) {
				var attr = 'tpd-data',
					str = 'values';
				attr = attr + '="' + elem.attr(attr) + '"';
				return '<thead ' + attr + '></thead>' +
					'<tbody><tr ng-repeat="' + str + ' in ' + elem.prop('dataset').expression + '" ' + attr + ' tpd-values="' + str + '"></tr></tbody>';
			})
			.component('thead, tfoot', '<tr><th scope="col" tpd-property tpd-label></th></tr>')
			.component('tbody > tr', '<td tpd-property>' + outputHtml + '</td>', {
				number: '<td style="text-align: right;">' + outputHtml + '</td>'
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

	function tpdDataCompile() {
		return {
			restrict: 'A',
			compile: compile,
			priority: 1010 // Executed before directive "ngRepeat" and other custom ones
		};

		function compile(element) {
			var component = getComponent(element);
			if (!component)
				return;

			var content = component[0];
			if (angular.isFunction(content))
				content = content(element);

			var attrContent = '$property in $$data';
			element.html(
				$('<div>')
					.html(content)
					.find('[tpd-property]')
					.attr('ng-repeat', attrContent)
					.end()
					.find('[tpd-property-start]')
					.attr('ng-repeat-start', attrContent)
					.end()
					.find('[tpd-property-end]')
					.attr('ng-repeat-end', '')
					.end()
					.html()
			);
		}
	}

	function tpdDataLink($injector) {
		return {
			restrict: 'A',
			scope: true,
			link: link
		};

		function link(scope, element, attrs) {
			var component = getComponent(element);
			if (!component)
				return;

			var data = angular.copy(scope.$eval(attrs[this.name])),
				values = scope.$eval(attrs.tpdValues);
			angular.forEach(data, function (property) {
				property.type = registers.aliases.listed[property.type] || property.type || 'string';
				if (values) {
					var name = property.name;
					scope.$watch(function () {
						return values[name];
					}, function (value) {
						property.value = getFn(property, 'fromJson')(value);
					});
					scope.$watch(function () {
						return property.value;
					}, function (value) {
						values[name] = getFn(property, 'toJson')(value);
					});
				}
			});
			scope.$$data = data;

			scope.$$ec = component[1];

			function getFn(property, opt) {
				var opt = getType(property)[opt];
				if (angular.isString(opt))
					opt = $injector.get(opt);
				if (angular.isArray(opt))
					opt = $injector.invoke(opt);
				return opt;
			}
		}
	}

	function tpdProperty($compile) {
		return getPropDirectiveDefinitionObj($compile);
	}

	function tpdPropertyStart($compile) {
		return getPropDirectiveDefinitionObj($compile, function (element) {
			element
				.nextUntil('[tpd-property-end]')
				.next()
				.remove()
				.end()
				.remove();
		});
	}

	function tpdLabel() {
		return {
			restrict: 'A',
			template: template
		};

		function template() {
			return '<span translate="{{$property.label}}"></span>';
		}
	}

	function tpdInput($injector, $compile) {
		return getInputDirectiveDefinitionObj(function link(scope, element, attrs) {
			var input = getType(scope.$property).input;

			var parsedInput = $.parseHTML(input);
			if (parsedInput.length == 1 && !parsedInput[0].tagName)
				input = $injector.get(input);
			if (angular.isArray(input))
				input = $injector.invoke(input);
			if (angular.isFunction(input))
				input = input(scope);
			if (angular.isElement(input)) {
				if (!(input instanceof jQuery))
					input = $(input);
				input = input.appendTo('<div>').parent().html();
			}

			input = $(input);
			var targetElem = input.find('[tpd-target]'),
				propStr = '$property';
			input.attr(getAttrs(attrs));
			(targetElem.length ? targetElem : input).attr({
				'ng-model': propStr + '.value',
				'ng-required': propStr + '.required',
				'ng-attr-min': '{{' + propStr + '.min}}',
				'ng-attr-max': '{{' + propStr + '.max}}'
			});
			element.replaceWith($compile(input)(scope));
		});
	}

	function tpdOutput($compile) {
		return getInputDirectiveDefinitionObj(function link(scope, element, attrs) {
			var output = getType(scope.$property).output;
			if (angular.isFunction(output))
				output = output(scope);
			element.replaceWith($compile($('<span>' + output + '</span>').attr(getAttrs(attrs)))(scope));
		});
	}

	function tpdPassword() {
		return function (str) {
			return _.repeat('●', _.size(str));
		};
	}

	function tpdOption() {
		return function (id, opts) {
			var item = _.find(opts, ['id', id]);
			return item && item.label;
		};
	}

	function tpdOptions() {
		return function (ids, opts) {
			if (ids) {
				var list = [];
				angular.forEach(opts, function (opt) {
					if (ids.indexOf(opt.id) != -1)
						list.push(opt.label);
				});
				return list;
			}
		};
	}

	function getType(name, isOriginal) {
		if (angular.isObject(name))
			name = name.type;
		return registers.types[isOriginal ? 'original' : 'stored'][name];
	}

	function getComponent(selection) {
		var matches = [];

		angular.forEach(registers.components, function (opts, selector) {
			if (selection.is(selector))
				matches.push({
					selector: selector,
					opts: opts
				});
		});

		if (matches.length == 1)
			return matches[0].opts;

		var selector,
			opts;
		angular.forEach(matches, function (match) {
			if (!selector || SPECIFICITY.compare(selector, match.selector) < 0) {
				selector = match.selector;
				opts = match.opts;
			}
		});
		return opts;
	}

	function getPropDirectiveDefinitionObj($compile, callback) {
		return {
			restrict: 'A',
			link: link
		};

		function link(scope, element) {
			var ec = scope.$$ec;
			if (ec) {
				ec = ec[scope.$property.type];
				if (angular.isFunction(ec))
					ec = ec(element.closest('[tpd-data]'));
				if (ec) {
					(callback || angular.noop)(element);
					element.replaceWith($compile(ec)(scope));
				}
			}
		}
	}

	function getInputDirectiveDefinitionObj(linkFn) {
		return {
			restrict: 'E',
			link: linkFn,
			priority: 601 // To avoid previous execution of directive "ngIf"
		};
	}

	function getAttrs(attrs) {
		var elemAttrs = {};
		angular.forEach(attrs.$attr, function (name, normalizedName) {
			elemAttrs[name] = attrs[normalizedName];
		});
		return elemAttrs;
	}
})();