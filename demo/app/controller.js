angular
	.module('app')
	.controller('AppController', AppController);

function AppController(fakeHttp) {
	var vm = this;
	vm.filter = {
		data: [
			['name', 'Name'],
			{
				type: 'oo',
				name: 'gender',
				label: 'Gender',
				options: 'vm.genders',
				required: true
			},
			['year', 'Year', false, 'y'],
			{
				type: 'n',
				name: 'maxWeight',
				label: '<abbr title="Maximum">Max.</abbr> weight (kg)',
				required: true
			},
			['email', 'E-mail', false, 'email'],
			['isForeign', 'Foreign?', false, 'b']
		],
		values: {}
	};
	vm.genders = [];
	vm.limits = {};
	vm.doFilter = doFilter;
	vm.list = {
		data: [],
		values: {}
	};
	vm.toggleEdit = toggleEdit;

	activate();

	function activate() {
		vm.filter.values = fakeHttp.get('filter');
		angular.forEach(fakeHttp.get('genders'), function (label, code) {
			vm.genders.push({
				id: code,
				label: label
			});
		});
		vm.limits = fakeHttp.get('limits');

		var fd = angular.copy(vm.filter.data),
			fd3 = fd[3];
		fd[1].type = 'o';
		fd[2] = ['birthday', 'Birthday', false, 'date'];
		fd3.name = 'weight';
		fd3.label = 'Weight (kg)';
		angular.forEach(fd, function (property) {
			delete property.required;
		});
		vm.list.data = fd;

		doFilter();
	}

	function doFilter() {
		vm.list.values = fakeHttp.get('list', vm.filter.values);
	}

	function toggleEdit(item) {
		item.$$isEditing = !item.$$isEditing;
		if (!item.$$isEditing)
			fakeHttp.post('item', item);
	}
}