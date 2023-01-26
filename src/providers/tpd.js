var registers = {
	types: {
		original: {},
		stored: {}
	},
	components: {
		list: [],
		original: {},
		stored: {}
	},
};

angular
	.module('tpd')
	.provider('tpd', tpdProvider);

function tpdProvider(tpdRegisterUtilsProvider) {
	var defOpts = {
		fromJson: angular.identity,
		toJson: function (v) {
			if (v && v.toJSON)
				return v.toJSON();
			return v;
		},
		input: undefined,
		output: '<span>{{$tpdProp.value}}</span>'
	},
		DEF_TYPE_NAME = 'string';

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
			var components = registers.components,
				list = [];
			angular.forEach(components.list, function (selector) {
				var args = angular.copy(components.stored[selector]);
				list.push({
					selector: selector,
					content: args[0],
					ec: args[1]
				});
			});
			return list;
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
		if (!hasSomeType(['string', 'array'], name)) {
			tpdRegisterUtilsProvider.showError('TRN');
			return;
		}
		if (!hasSomeType(['object', 'function', 'array'], opts)) {
			tpdRegisterUtilsProvider.showError('TRO', name);
			return;
		}

		var types = registers.types,
			original = types.original;

		if (name == '*')
			name = _.keys(original);
		if (angular.isArray(name)) {
			angular.forEach(name, function (name) {
				var origOpts = angular.copy(opts);
				setType(name, origOpts);
			});
			return;
		}

		var copiedType = name;
		if (angular.isArray(opts)) {
			copiedType = opts[0];

			if (!getType(copiedType)) {
				tpdRegisterUtilsProvider.showError('TNR', copiedType);
				return;
			}

			opts = opts[1];
			forEachComponentArgs(function (args) {
				var ec = args[1];
				angular.forEach(ec, function (opt, typeName) {
					if (typeName == copiedType)
						ec[name] = opt;
				});
			});
		}
		if (angular.isFunction(opts)) {
			if (!getType(copiedType)) {
				tpdRegisterUtilsProvider.showError('TNR', copiedType);
				return;
			}
			opts = opts(angular.copy(original[copiedType]));
		}

		var origOpts = angular.copy(opts);

		opts = opts || {};
		angular.forEach(defOpts, function (defOpt, prop) {
			opts[prop] = opts[prop] || defOpt;
		});

		original[name] = origOpts;

		angular.forEach(['input', 'output'], function (prop) {
			opts[prop] = tpdRegisterUtilsProvider.toString(opts[prop]);
		});
		types.stored[name] = opts;

		if (name == DEF_TYPE_NAME)
			defOpts.input = (origOpts || {}).input;
	}

	function getType(name) {
		return angular.copy(registers.types.stored[name]);
	}

	function removeType(name) {
		if (name == DEF_TYPE_NAME)
			tpdRegisterUtilsProvider.showError('TSU', name);
		else {
			if (getType(name)) {
				angular.forEach(registers.types, function (list) {
					delete list[name];
				});
				forEachComponentArgs(function (args) {
					var ec = args[1];
					if (ec)
						delete ec[name];
				});
			} else
				tpdRegisterUtilsProvider.showError('TNR', name);
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
		if (!angular.isString(selector)) {
			tpdRegisterUtilsProvider.showError('CRS');
			return;
		}
		if (!hasSomeType(['string', 'element', 'array', 'function'], content)) {
			tpdRegisterUtilsProvider.showError('CRC', selector);
			return;
		}

		var overwritten = angular.copy(registers.components.original[selector]),
			isNew = !overwritten;

		if (!isNew)
			ec = ec || overwritten[1];

		if (angular.isFunction(content)) {
			if (!overwritten) {
				tpdRegisterUtilsProvider.showError('CNR', selector);
				return;
			}
			content = content(overwritten[0]);
		}
		if (angular.isFunction(ec)) {
			if (!overwritten) {
				tpdRegisterUtilsProvider.showError('CNR', selector);
				return;
			}
			ec = ec(overwritten[1]);
		}

		var args = [content];
		if (ec) { // Exceptional containers
			if (!angular.isObject(ec) || angular.isArray(ec)) {
				tpdRegisterUtilsProvider.showError('CRE', selector);
				return;
			}
			args.push(ec);
		}
		forEachComponentsList(function (components, isStored) {
			var savedArgs = [];
			if (isStored) {
				savedArgs[0] = tpdRegisterUtilsProvider.toString(args[0]);
				savedArgs[1] = {};
				angular.forEach(args[1], function (opt, typeName) {
					savedArgs[1][typeName] = tpdRegisterUtilsProvider.toString(opt);
				});
			} else
				savedArgs = args;
			components[selector] = savedArgs;
		});

		if (isNew)
			registers.components.list.push(selector);
	}

	function getComponent(selector) {
		return angular.copy(registers.components.stored[selector]);
	}

	function removeComponent(selector) {
		if (getComponent(selector)) {
			_.remove(registers.components.list, function (selector2) { return selector2 == selector; });
			forEachComponentsList(function (components) {
				delete components[selector];
			});
		} else
			tpdRegisterUtilsProvider.showError('CNR', selector);

		return this;
	}
}

function hasSomeType(types, v) {
	var methodByType = {
		string: 'isString',
		function: 'isFunction',
		array: 'isArray',
		element: 'isElement',
		object: 'isPlainObject'
	},
		hasSome = false;
	_.forEach(types, function (type) {
		if (_[methodByType[type]](v)) {
			hasSome = true;
			return false;
		}
	});
	return hasSome;
}

function forEachComponentArgs(cb) {
	forEachComponentsList(function (components) {
		angular.forEach(components, function (args) {
			cb(args);
		});
	});
}

function forEachComponentsList(cb) {
	var components = registers.components;
	angular.forEach([components.original, components.stored], function (components, i) {
		cb(components, !!i);
	});
}