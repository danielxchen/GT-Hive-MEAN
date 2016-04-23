angular.module('mainCtrl', ['uiGmapgoogle-maps', 'buildingService'])

.controller('mainController', function($scope, uiGmapGoogleMapApi, Building, $log) {

	var vm = this;
	
	vm.processing  = true;

	$scope.markers = [];

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

	$scope.mapOptions = {
        disableDefaultUI: true,
        minZoom: 10,
        maxZoom: 16,
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
        $scope.windowOptions.show = false;
    };

	// uiGmapGoogleMapApi is a promise.
    // The "then" callback function provides the google.maps object.
    uiGmapGoogleMapApi.then(function(maps) {

    	$scope.map = {
	  		center: { latitude: 33.7762, longitude: -84.3975 },
	  		zoom: 16,
	  		options: $scope.mapOptions,
		    polygons: [
            {
                id: 1,
                path: [
				    {
						latitude:33.755414,
						longitude:-84.426842,
					},
					{
						latitude:33.798220,
						longitude:-84.426842,
					},
					{
						latitude:33.798220,
						longitude:-84.370837,
					},
					{
						latitude:33.755414,
						longitude:-84.370837,

					},
					{
						latitude:33.755414,
						longitude:-84.426842,
					},
					{
						latitude:33.771478,
						longitude:-84.396050,
					},
					{
						latitude:33.771371,
						longitude:-84.390578,
					},
					{
						latitude:33.781519,
						longitude:-84.391265,
					},
					{
						latitude:33.781519,
						longitude:-84.400556,
					},
					{
						latitude:33.781546,
						longitude:-84.407310,
					},
					{
						latitude:33.778367,
						longitude:-84.407254,
					},
					{
						latitude:33.776740,
						longitude:-84.406167,
					},
					{
						latitude:33.774073,
						longitude:-84.403115,
					},
					{
						latitude:33.773618,
						longitude:-84.401951,
					},
					{
						latitude:33.773261,
						longitude:-84.399912,
					},
					{
						latitude:33.772958,
						longitude:-84.398078,
					},
					{
						latitude:33.772655,
						longitude:-84.397101,
					},
					{
						latitude:33.771478,
						longitude:-84.396050,
					}
                ],
                stroke: {
                    color: '#000000',
                    weight: 2
                },
                geodesic: false,
                visible: true,
                fill: {
                    color: '#CACACA',
                    opacity: 0.7
                }
            }
        ]};

		return Building.all();

	}).then(function(response) {
		vm.buildings = response.data;

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
			if (building.occupancy <= 40)
				marker.icon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
			else if (building.occupancy <= 80)
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
                    $scope.infoWindow.templateParameter.building_id = marker.id;
					$scope.infoWindow.options.show = true;
				});
			};

			return marker;
		};

		// Create markers for all of the buildings
		for (var i = 0; i < vm.buildings.length; i++) {
			$scope.markers.push(createMarker(i, vm.buildings[i]));
		}

	}).catch(function() {
		// log an error
		$log.log('Error occurred, see logs.');

	}).then(function() {
		vm.processing = false;
    });
});