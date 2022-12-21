angular
	.module('app')
	.controller('AppController', AppController);

function AppController(fakeHttp) {
	var vm = this;
	vm.filter = {
		data: [
			{
				name: 'name',
				label: 'name'
			},
			{
				type: 'oo',
				name: 'gender',
				label: 'gender',
				options: 'vm.genders',
				required: true
			},
			{
				type: 'y',
				name: 'year',
				label: 'year'
			},
			{
				type: 'n',
				name: 'maxWeight',
				label: 'maxWeight',
				required: true
			},
			{
				type: 'email',
				name: 'email',
				label: 'email'
			},
			{
				type: 'b',
				name: 'isForeign',
				label: 'foreign?'
			}
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

		var fd = angular.copy(vm.filter.data);
		fd[1].type = 'o';
		fd[2] = {
			type: 'date',
			name: 'birthdate',
			label: 'birthdate'
		};
		angular.forEach(['name', 'label'], function (prop) {
			fd[3][prop] = 'weight';
		});
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