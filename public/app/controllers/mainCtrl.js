angular.module('mainCtrl', ['uiGmapgoogle-maps', 'buildingService'])

.controller('mainController', function($scope, uiGmapGoogleMapApi, Building, $log) {

	var vm = this;

	$scope.markers = [];

	vm.processing  = true;

	// uiGmapGoogleMapApi is a promise.
    // The "then" callback function provides the google.maps object.
    uiGmapGoogleMapApi.then(function(maps) {

    	$scope.map = {
	  		center: { latitude: 33.7753, longitude: -84.3975 },
	  		zoom: 16
		};

		return Building.all();

	}).then(function(response) {
		vm.buildings = response.data;

		var bids = [];

		for (var i = 0; i < vm.buildings.length; i++) {
			bids.push(vm.buildings[i].bid);
		}

		return Building.updateOccupancies(bids);

	}).then(function(updated) {
		for (var i = 0; i < vm.buildings.length; i++) {
			vm.buildings[i].occupancy = updated.data.occupancies[vm.buildings[i].bid].occupancy;
		}

		vm.processing = false;

		var createMarker = function(i, building) {
			var marker = {
				id: i,
				title: building.name,
				latitude: building.latitude,
				longitude: building.longitude
			};

			// Set color
			if (building.occupancy <= 40)
				marker['icon'] = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
			else if (building.occupancy <= 80)
				marker['icon'] = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
			else
				marker['icon'] = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';

			return marker;
		}

		for (var i = 0; i < vm.buildings.length; i++) {
			$scope.markers.push(createMarker(i, vm.buildings[i]));
		}
    });	
});