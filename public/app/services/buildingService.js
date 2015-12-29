angular.module('buildingService', [])

.factory('Building', function($http, $log) {

	var buildingFactory = {};

	buildingFactory.all = function() {
		return $http.get('/api/angular/buildings');
	};

	buildingFactory.getOccupancy = function(bid) {
		return $http.get('/api/locationinfo/b_id=' + bid);
	};

	buildingFactory.updateOccupancies = function(bids) {

		var str = '';
		var length = bids.length;
		for (var i = 0; i < length - 1; i++) {
			str += 'b_id=' + bids[i] + '&';
		}
		str += 'b_id=' + bids[length - 1];

		//$log.log(str);

		return $http.get('/api/locationinfo/' + str);
	}

	return buildingFactory;
});