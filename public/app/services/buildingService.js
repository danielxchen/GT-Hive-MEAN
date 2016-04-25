angular.module('buildingService', [])

.factory('Building', function($http, $log) {

	var buildingFactory = {};

	// Get all buildings
	buildingFactory.all = function() {
		return $http.get('/api/buildings');
	};

	// Get a single building
	buildingFactory.get = function(bid) {
		return $http.get('/api/buildings/' + bid);
	};

	buildingFactory.chartData = function(bid) {
		return $http.get('/api/chartdata/' + bid);
	}

	return buildingFactory;
});
