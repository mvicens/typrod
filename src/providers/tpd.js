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
	.provider('$tpd', $tpdProvider);

function $tpdProvider(tpdGetStrProvider) {
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
			var components = registers.components,
				list = [];
			angular.forEach(components.list, function (selector) {
				var opts = components.stored[selector];
				list.push({
					selector: selector,
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
			forEachComponentOpts(function (opts) {
				var ec = opts[1];
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

		opts.input = tpdGetStrProvider.getStr(opts.input, undefined, true);
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

				forEachComponentOpts(function (opts) {
					var ec = opts[1];
					if (ec)
						delete ec[name];
				});
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
		var overwritten = registers.components.original[selector];
		if (angular.isFunction(content))
			content = content(overwritten[0]);
		if (angular.isFunction(ec))
			ec = ec(overwritten[1]);

		if (!overwritten)
			registers.components.list.push(selector);

		var opts = [content];
		if (ec) // Exceptional containers
			opts.push(ec);
		forEachComponentsList(function (components, isStored) {
			var savedOpts = [];
			if (isStored) {
				savedOpts[0] = tpdGetStrProvider.getStr(opts[0]);
				savedOpts[1] = {};
				angular.forEach(opts[1], function (opt, typeName) {
					savedOpts[1][typeName] = tpdGetStrProvider.getStr(opt);
				});
			} else
				savedOpts = opts;
			components[selector] = savedOpts;
		});
	}

	function getComponent(selector) {
		return registers.components.stored[selector];
	}

	function removeComponent(selector) {
		_.remove(registers.components.list, function (selector2) { return selector2 == selector; });
		forEachComponentsList(function (components) {
			delete components[selector];
		});

		return this;
	}
}

function forEachComponentOpts(cb) {
	forEachComponentsList(function (components) {
		angular.forEach(components, function (opts) {
			cb(opts);
		});
	});
}

function forEachComponentsList(cb) {
	var components = registers.components;
	angular.forEach([components.original, components.stored], function (components, i) {
		cb(components, !!i);
	});
}