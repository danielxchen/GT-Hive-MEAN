angular.module('buildingCtrl', ['buildingService', 'chart.js'])

.controller('buildingController', function($scope) {
    // TODO(justin): setup chart, data
        // <script type="text/javascript">
        //     var data = {
        //         labels: ['monday', 'tuesday', 'wednesday', 'thursday'],
        //         datasetes: [
        //             {
        //                 label: "set 1",
        //                 fillColor: "rgba(220,220,220,0.2)",
        //                 strokeColor: "rgba(220,220,220,1)",
        //                 pointColor: "rgba(220,220,220,1)",
        //                 pointStrokeColor: "#fff",
        //                 pointHighlightFill: "#fff",
        //                 pointHighlightStroke: "rgba(220,220,220,1)",
        //                 data: [65, 59, 80, 81, 56, 55, 40]
        //             }
        //         ]
        //     }
        //     var ctx = document.getElementById("occupancyVsTime").getContext("2d");
        //     var chart = new Chart(ctx).Line(data, options);
        // </script>

    $scope.labels = ['monday', 'tuesday', 'wednesday', 'thursday'];
    $scope.series = ['Series A'];
    $scope.data = [
        [65, 59, 80, 81]
    ];
});
