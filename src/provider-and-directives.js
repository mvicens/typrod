var registers = {
	types: {
		original: {},
		stored: {}
	},
	components: []
};

angular
	.module('tpd')
	.provider('$tpd', $tpdProvider)
	.directive('tpdData', tpdDataCompile)
	.directive('tpdData', tpdDataLink) // To get scope of "ngRepeat"
	.directive('tpdProp', tpdProp)
	.directive('tpdPropStart', tpdPropStart)
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
		output: '{{$tpdProp.value}}'
	};
	this.$get = $get;
	this.type = type;
	this.removeType = removeType;
	this.component = component;
	this.removeComponent = removeComponent;

	function $get() {
		function getRegisters() {
			return {
				types: getTypes(),
				components: getComponents()
			};
		};
		getRegisters.types = getTypes;
		getRegisters.components = getComponents;
		return getRegisters;

		function getTypes() {
			return angular.copy(registers.types.stored);
		}

		function getComponents() {
			var list = [];
			angular.forEach(registers.components, function (values) {
				var opts = values[1];
				list.push({
					selector: values[0],
					content: opts[0],
					ec: opts[1]
				});
			});
			return angular.copy(list);
		}
	}

	function type(name, opts) {
		if (opts) {
			setType(name, opts);
			return this;
		}
		if (opts === null) {
			removeType(name);
			return this;
		}
		return getType(name);
	}

	function setType(name, opts) {
		var types = registers.types,
			original = types.original;

		if (name == '*') {
			angular.forEach(_.keys(original), function (name) {
				setType(name, opts);
			});
			return;
		}

		var copiedType = name;
		if (angular.isArray(opts)) {
			copiedType = opts[0];
			opts = opts[1];
			angular.forEach(registers.components, function (values) {
				var ec = values[1][1];
				angular.forEach(ec, function (opt, typeName) {
					if (typeName == copiedType)
						ec[name] = opt;
				});
			});
		}
		if (angular.isFunction(opts))
			opts = opts(angular.copy(original[copiedType]));

		var origOpts = angular.copy(opts);

		opts = opts || {};
		angular.forEach(defOpts, function (defOpt, prop) {
			opts[prop] = opts[prop] || defOpt;
		});

		original[name] = origOpts;
		types.stored[name] = opts;

		if (name == 'string')
			defOpts.input = (origOpts || {}).input;
	}

	function getType(name) {
		return registers.types.stored[name];
	}

	function removeType(name) {
		if (name != 'string') {
			var types = registers.types;
			angular.forEach(['original', 'stored'], function (prop) {
				delete types[prop][name];
			});

			angular.forEach(registers.components, function (values) {
				var ec = values[1][1];
				if (ec)
					delete ec[name];
			});
		}
		return this;
	}

	function component(selector, content, ec) {
		if (content) {
			setComponent(selector, content, ec);
			return this;
		}
		if (content === null) {
			removeComponent(selector);
			return this;
		}
		return getComponent(selector);
	}

	function setComponent(selector, content, ec) {
		var overwritten = getComponent(selector);
		if (angular.isFunction(content))
			content = content(overwritten[0]);
		if (angular.isFunction(ec))
			ec = ec(overwritten[1]);

		var opts = [content];
		if (ec) // Exceptional containers
			opts.push(ec);
		var components = registers.components;
		if (overwritten)
			_.forEach(components, function (values) {
				if (values[0] == selector) {
					values[1] = opts;
					return false;
				}
			});
		else
			components.push([selector, opts]);
	}

	function getComponent(selector) {
		var component;
		_.forEach(registers.components, function (values) {
			if (values[0] == selector) {
				component = values[1];
				return false;
			}
		});
		return component;
	}

	function removeComponent(selector) {
		_.remove(registers.components, function (values) { return values[0] == selector; });
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
		var component = getComponentByElem(element);
		if (!component)
			return;

		var content = component[0];
		content = getStr(content, element);

		var ATTR_CONTENT = '$tpdProp in $$tpdData';
		element.html(
			$('<div>')
				.html(content)
				.find('[tpd-prop]')
					.attr('ng-repeat', ATTR_CONTENT)
				.end()
				.find('[tpd-prop-start]')
					.attr('ng-repeat-start', ATTR_CONTENT)
				.end()
				.find('[tpd-prop-end]')
					.attr('ng-repeat-end', '')
				.end()
				.html()
		);
	}
}

function tpdDataLink($sce) {
	return {
		restrict: 'A',
		scope: true,
		link: link
	};

	function link(scope, element, attrs) {
		var component = getComponentByElem(element);
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

			property.type = property.type || 'string';
			property.label = $sce.trustAsHtml(property.label);
			if (values) {
				var NAME = property.name;
				scope.$watch(function () {
					return values[NAME];
				}, function (value) {
					property.value = getTypeByProp(property).fromJson(value);
				});
				scope.$watch(function () {
					return property.value;
				}, function (value) {
					values[NAME] = getTypeByProp(property).toJson(value);
				});
			}
		});
		scope.$$tpdData = data;

		scope.$$tpdEc = component[1];
	}
}

function tpdProp($compile) {
	return getPropDirectiveDefinitionObj($compile);
}

function tpdPropStart($compile) {
	return getPropDirectiveDefinitionObj($compile, function (element) {
		element
			.nextUntil('[tpd-prop-end]')
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
		return '<span ng-bind-html="$tpdProp.label"></span>';
	}
}

function tpdInput($compile) {
	return getInputDirectiveDefinitionObj(function link(scope, element, attrs) {
		var input = getTypeByProp(scope.$tpdProp).input;
		input = getStr(input, scope, true);

		input = $(input);
		var targetElem = input.find('[tpd-target]'),
			propStr = '$tpdProp';
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
		var output = getTypeByProp(scope.$tpdProp).output;
		if (angular.isFunction(output))
			output = output(scope);
		element.replaceWith($compile($('<span>' + output + '</span>').attr(getAttrs(attrs)))(scope));
	});
}

function getTypeByProp(prop) {
	return registers.types.stored[prop.type];
}

function getComponentByElem(selection) {
	var matches = [];

	angular.forEach(registers.components, function (values) {
		var selector = values[0];
		if (selection.is(selector))
			matches.push({
				selector: selector,
				opts: values[1]
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

function getStr(v, arg, hasElem) {
	if (angular.isString(v))
		return v;
	if (angular.isFunction(v))
		return v(arg);
	if (hasElem && angular.isElement(v)) {
		if (!(v instanceof jQuery))
			v = $(v);
		return v.appendTo('<div>').parent().html();
	}
	if (angular.isArray(v)) { // Joining array
		var str = '';
		angular.forEach(v, function (v2, i) {
			str += getStr(v2, arg, hasElem);
		});
		return str;
	}
}

function getPropDirectiveDefinitionObj($compile, callback) {
	return {
		restrict: 'A',
		link: link
	};

	function link(scope, element) {
		var ec = scope.$$tpdEc;
		if (ec) {
			ec = getStr(ec[scope.$tpdProp.type], element.closest('[tpd-data]'));
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