angular.module('app.routes', ['ngRoute'])

.config(function($routeProvider, $locationProvider) {

	$routeProvider

		// route for the home page
		.when('/', {
			templateUrl : 'app/views/pages/home.html'
		})

		// route for a building
		.when('/buildings/:bid', {
			templateUrl: 'app/views/pages/building.html'
		});

	$locationProvider.html5Mode(true);

});