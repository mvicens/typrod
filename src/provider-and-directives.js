var registers = {
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
	.module('tpd')
	.provider('$tpd', $tpdProvider)
	.directive('tpdData', tpdDataCompile)
	.directive('tpdData', tpdDataLink) // To get scope of "ngRepeat"
	.directive('tpdProperty', tpdProperty)
	.directive('tpdPropertyStart', tpdPropertyStart)
	.directive('tpdLabel', tpdLabel)
	.directive('tpdInput', tpdInput)
	.directive('tpdOutput', tpdOutput);

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

		if (name == 'string')
			defOpts.input = (origOpts || {}).input;

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

		var ATTR_CONTENT = '$property in $$data';
		element.html(
			$('<div>')
				.html(content)
				.find('[tpd-property]')
					.attr('ng-repeat', ATTR_CONTENT)
				.end()
				.find('[tpd-property-start]')
					.attr('ng-repeat-start', ATTR_CONTENT)
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
		angular.forEach(data, function (property, i) {
			if (angular.isArray(property)) {
				var keys = ['name', 'label', 'required', 'type'],
					obj = {};
				angular.forEach(keys, function (key, j) {
					obj[key] = property[j];
				});
				data[i] = property = angular.merge(obj, property[keys.length]);
			}

			property.type = registers.aliases.listed[property.type] || property.type || 'string';
			if (values) {
				var NAME = property.name;
				scope.$watch(function () {
					return values[NAME];
				}, function (value) {
					property.value = getFn(property, 'fromJson')(value);
				});
				scope.$watch(function () {
					return property.value;
				}, function (value) {
					values[NAME] = getFn(property, 'toJson')(value);
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