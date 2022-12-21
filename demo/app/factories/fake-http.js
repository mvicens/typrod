const Chance = require('chance'),
	chance = new Chance();

angular
	.module('app')
	.factory('fakeHttp', fakeHttp); // Simulates HTTP request

function fakeHttp(getStrDate, filterFilter) {
	var GENDERS = { m: 'Male', f: 'Female' },
		GENDERS_LIST = [],
		LAST_YEAR = (new Date()).getFullYear() - 1,
		MIN_YEAR = LAST_YEAR - 80,
		MIN_WEIGHT = 10,
		MAX_WEIGHT = 100;
	angular.forEach(GENDERS, function (label, code) {
		GENDERS_LIST.push(code);
	});

	var LIST = [],
		n = 1;
	for (var i = 0; i < 10; i++) {
		var code = GENDERS_LIST[+chance.bool()];
		LIST.push({
			id: n++,
			name: chance.name({ gender: code == 'm' ? 'male' : 'female' }),
			gender: code,
			birthdate: getStrDate(chance.date({ year: chance.year({ min: MIN_YEAR, max: LAST_YEAR }) })),
			weight: chance.floating({ min: MIN_WEIGHT, max: MAX_WEIGHT, fixed: 2 }),
			email: chance.email(),
			isForeign: +chance.bool()
		});
	}

	return {
		get: get,
		post: post
	};

	function get(url, params) {
		switch (url) {
			case 'filter':
				return {
					name: '',
					gender: GENDERS_LIST.join(),
					year: null,
					maxWeight: MAX_WEIGHT,
					email: '',
					isForeign: 0
				};
			case 'genders':
				return GENDERS;
			case 'limits':
				return {
					year: { min: MIN_YEAR, max: LAST_YEAR },
					weight: { min: MIN_WEIGHT, max: MAX_WEIGHT }
				};
			case 'list':
				return filterFilter(filterFilter(angular.copy(LIST), {
					name: params.name,
					email: params.email
				}), function (item) {
					var isMatched = false;
					angular.forEach(params.gender.split(','), function (code) {
						if (code == item.gender)
							isMatched = true;
					});
					if (!isMatched)
						return false;

					var py = params.year;
					if (py && (new Date(item.birthdate)).getFullYear() != py)
						return false;

					var iw = item.weight,
						pmw = params.maxWeight;
					if (iw > pmw)
						return false;

					return item.isForeign == params.isForeign;
				});
		}
	}

	function post(url, params) {
		if (url == 'item')
			angular.forEach(LIST, function (item, i, list) {
				if (item.id == params.id)
					list[i] = params;
			});
	}
}