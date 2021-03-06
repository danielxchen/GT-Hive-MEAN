angular.module('mainCtrl', ['uiGmapgoogle-maps', 'buildingService'])

.controller('mainController', function($scope, uiGmapGoogleMapApi, Building, $log) {

	var vm = this;
	
	vm.processing  = true;

	$scope.markers = [];

	$scope.safeBuildings = [];

	$scope.itemsByPage = 15;

	$scope.selectedMarker = {};

	$scope.infoWindow = {
		options: {
			show: false
		},
		templateUrl: "app/views/templates/info.html",
        templateParameter: {
         	title: "",
         	occupancy: "",
            building_id: -1,
        }	
	};

	$scope.rowCollection = [
        {firstName: 'Laurent', lastName: 'Renard', balance: 102, email: 'whatever@gmail.com'},
        {firstName: 'Blandine', lastName: 'Faivre', balance: -2323.22, email: 'oufblandou@gmail.com'},
        {firstName: 'Francoise', lastName: 'Frere', balance: 42343, email: 'raymondef@gmail.com'}
    ];

	$scope.mapOptions = {
        disableDefaultUI: true,
        scrollwheel: false,
        styles: [{
            featureType: "poi",
            elementType: "labels",
            stylers: [{
                visibility: "off"
            }]
        }, {
            featureType: "poi.park",
            elementType: "labels",
            stylers: [{
                visibility: "on"
            }]
        }]
    };

    $scope.closeClick = function() {
        $scope.infoWindow.options.show = false;
    };

	// uiGmapGoogleMapApi is a promise.
    // The "then" callback function provides the google.maps object.
    uiGmapGoogleMapApi.then(function(maps) {

    	$scope.map = {
	  		center: { latitude: 33.7764, longitude: -84.3985 },
	  		zoom: 16,
	  		options: $scope.mapOptions,
		};

		return Building.all();

	}).then(function(response) {
        // filter based on show_on_map property
        vm.buildings = [];
        response.data.forEach(function(building) {
        	$scope.safeBuildings.push(building);
            if (building.show_on_map) {
                vm.buildings.push(building);
            }
        });

		// Create marker for a building
		var createMarker = function(i, building) {
			var marker = {
				id: i,
				coords: {
		            latitude: building.latitude,
		            longitude: building.longitude
		        },
				options: { title: building.name, labelContent: building.abbreviation }
			};

			// Set color
			if (building.occupancy <= (building.capacity * 0.4))
				marker.icon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
			else if (building.occupancy <= (building.capacity * 0.8))
				marker.icon = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
			else
				marker.icon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';

			// Add onClick
			marker.onClick = function() {
				$log.log(marker.options.title + ' clicked!');
				$scope.$apply(function() {
					$scope.selectedMarker = marker;
					$scope.infoWindow.templateParameter.title = marker.options.title;
					$scope.infoWindow.templateParameter.occupancy = vm.buildings[marker.id].occupancy;
                    console.log("marker id", marker.id);
                    console.log("bid", vm.buildings[marker.id].bid);
                    $scope.infoWindow.templateParameter.building_id = vm.buildings[marker.id].bid;
					$scope.infoWindow.options.show = true;
				});
			};

			return marker;
		};

		// Create markers for all of the buildings
		for (var i = 0; i < vm.buildings.length; i++) {
			$scope.markers.push(createMarker(i, vm.buildings[i]));
			//$scope.safeBuildings.push(vm.buildings[i]);
		}

	}).catch(function() {
		// log an error
		$log.log('Error occurred, see logs.');


	}).then(function() {
		vm.processing = false;
		//$scope.$apply();
		//$log.log($scope.builds[0].name);
    });
});