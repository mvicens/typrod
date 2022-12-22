const Chance = require('chance'),
	chance = new Chance();

angular
	.module('app')
	.factory('fakeHttp', fakeHttp); // Simulates HTTP request

function fakeHttp(filterFilter) {
	var genders = { m: 'Male', f: 'Female' },
		gendersList = [],
		LAST_YEAR = (new Date()).getFullYear() - 1,
		MIN_YEAR = LAST_YEAR - 80,
		MIN_WEIGHT = 10,
		MAX_WEIGHT = 100;
	angular.forEach(genders, function (label, code) {
		gendersList.push(code);
	});

	var list = [],
		n = 1;
	for (var i = 0; i < 10; i++) {
		var CODE = gendersList[+chance.bool()];
		list.push({
			id: n++,
			name: chance.name({ gender: CODE == 'm' ? 'male' : 'female' }),
			gender: CODE,
			birthday: chance.birthday({ year: chance.year({ min: MIN_YEAR, max: LAST_YEAR }) }).toISOString().split('T')[0],
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
					gender: gendersList.join(),
					year: null,
					maxWeight: MAX_WEIGHT,
					email: '',
					isForeign: 0
				};
			case 'genders':
				return genders;
			case 'limits':
				return {
					year: { min: MIN_YEAR, max: LAST_YEAR },
					weight: { min: MIN_WEIGHT, max: MAX_WEIGHT }
				};
			case 'list':
				return filterFilter(filterFilter(angular.copy(list), {
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

					var PY = params.year;
					if (PY && (new Date(item.birthday)).getFullYear() != PY)
						return false;

					if (item.weight > params.maxWeight)
						return false;

					return item.isForeign == params.isForeign;
				});
		}
	}

	function post(url, params) {
		if (url == 'item')
			angular.forEach(list, function (item, i) {
				if (item.id == params.id)
					list[i] = params;
			});
	}
}