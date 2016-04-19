angular.module('buildingCtrl', ['buildingService', 'chart.js'])

.controller('buildingController', function($scope, $routeParams, Building) {
    $scope.labels = ['monday', 'tuesday', 'wednesday', 'thursday'];
    $scope.series = ['Series A'];
    $scope.data = [
        [65, 59, 80, 81]
    ];

    console.log("Building page for building_id=" + $routeParams.bid);

    // TODO: use actual data
    // Building.get($routeParams.bid).then( function(res) {
    //     console.log(res);
    // });
});
