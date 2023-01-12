var registers = {
	types: {
		original: {},
		stored: {}
	},
	components: []
};

angular
	.module('tpd')
	.provider('$tpd', $tpdProvider);

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