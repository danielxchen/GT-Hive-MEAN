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
						latitude:33.733618,
						longitude:-84.454983,
					},
					{
						latitude:33.819230,
						longitude:-84.454983,
					},
					{
						latitude:33.819230,
						longitude:-84.342974,
					},
					{
						latitude:33.733618,
						longitude:-84.342974,

					},
					{
						latitude:33.733618,
						longitude:-84.454983,
					},
					{
						latitude:33.773618,
						longitude:-84.403067,
					},
					{
						latitude:33.773395,
						longitude:-84.402219,
					},
					{
						latitude:33.773395,
						longitude:-84.399698,
					},
					{
						latitude:33.772887,
						longitude:-84.397348,
					},
					{
						latitude:33.772450,
						longitude:-84.396329,
					},
					{
						latitude:33.771299,
						longitude:-84.390578,
					},
					{
						latitude:33.771335,
						longitude:-84.390514,
					},
					{
						latitude:33.773895,
						longitude:-84.391040,
					},
					{
						latitude:33.775924,
						longitude:-84.391136,
					},
					{
						latitude:33.777952,
						longitude:-84.391351,
					},
					{
						latitude:33.781502,
						longitude:-84.407401,
					},
					{
						latitude:33.781395,
						longitude:-84.407395,
					},
					{
						latitude:33.779837,
						longitude:-84.407476,
					},
					{
						latitude:33.778351,
						longitude:-84.407207,
					},
					{
						latitude:33.777448,
						longitude:-84.406755,
					},
					{
						latitude:33.776570,
						longitude:-84.406108,
					},
					{
						latitude:33.775955,
						longitude:-84.404815,
					},
					{
						latitude:33.774938,
						longitude:-84.404118,
					},
					{
						latitude:33.774332,
						longitude:-84.403067,
					},
					{
						latitude:33.773618,
						longitude:-84.403067,
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