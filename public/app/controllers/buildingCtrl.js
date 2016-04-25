angular.module('buildingCtrl', ['buildingService', 'chart.js'])

.controller('buildingController', function($scope, $routeParams, Building) {
    $scope.labels = ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'];
    $scope.series = ['Average', 'Today'];
    $scope.legend = true;

    $scope.data = [];

    $scope.safeFloors = [];

    Building.graphdata($routeParams.bid).then(function(res) {
        console.log("got graph data for bid=", $routeParams.bid);
        $scope.data = [res.data.averages, res.data.today];
    });

    Building.getFloors($routeParams.bid).then(function(res) {
        var floors = [];

        res.data.forEach(function(floor) {
            floors.push({name: "Floor " + floor.floor, occupancy: floor.occupancy});
        });

        $scope.safeFloors = floors;
    });
});
