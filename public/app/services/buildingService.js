angular.module('buildingService', [])

.factory('Building', function($http, $log) {

	var buildingFactory = {};

	// Get all buildings
	buildingFactory.all = function() {
		return $http.get('/api/buildings');
	};

	buildingFactory.graphdata = function(bid) {
		return $http.get('/api/graphdata/' + bid);
	};

	buildingFactory.getFloors = function(bid) {
		return $http.get('/api/buildings/' + bid);
	}

	return buildingFactory;
});
