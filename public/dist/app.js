angular.module("gthiveApp",["app.routes","mainCtrl","buildingCtrl","buildingService","uiGmapgoogle-maps","smart-table"]).config(["uiGmapGoogleMapApiProvider",function(e){e.configure({v:"3.20",libraries:"geometry,visualization"})}]),angular.module("app.routes",["ngRoute"]).config(["$routeProvider","$locationProvider",function(e,i){e.when("/",{templateUrl:"app/views/pages/home.html"}).when("/login",{templateUrl:"app/views/pages/login.html"}).when("/buildings/:bid",{templateUrl:"app/views/pages/building.html",controller:"buildingController"}),i.html5Mode(!0)}]),angular.module("buildingCtrl",["buildingService","chart.js"]).controller("buildingController",["$scope","$routeParams","Building",function(e,i,o){e.labels=["12am","1am","2am","3am","4am","5am","6am","7am","8am","9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm","7pm","8pm","9pm","10pm","11pm"],e.series=["Average","Today"],e.legend=!0,e.data=[],e.safeFloors=[],o.graphdata(i.bid).then(function(o){console.log("got graph data for bid=",i.bid),e.data=[o.data.averages,o.data.today]}),o.getFloors(i.bid).then(function(i){var o=[];i.data.forEach(function(e){o.push({name:"Floor "+e.floor,occupancy:e.occupancy})}),e.safeFloors=o})}]),angular.module("mainCtrl",["uiGmapgoogle-maps","buildingService"]).controller("mainController",["$scope","uiGmapGoogleMapApi","Building","$log",function(e,i,o,a){var n=this;n.processing=!0,e.markers=[],e.safeBuildings=[],e.itemsByPage=15,e.selectedMarker={},e.infoWindow={options:{show:!1},templateUrl:"app/views/templates/info.html",templateParameter:{title:"",occupancy:"",building_id:-1}},e.rowCollection=[{firstName:"Laurent",lastName:"Renard",balance:102,email:"whatever@gmail.com"},{firstName:"Blandine",lastName:"Faivre",balance:-2323.22,email:"oufblandou@gmail.com"},{firstName:"Francoise",lastName:"Frere",balance:42343,email:"raymondef@gmail.com"}],e.mapOptions={disableDefaultUI:!0,scrollwheel:!1,styles:[{featureType:"poi",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.park",elementType:"labels",stylers:[{visibility:"on"}]}]},e.closeClick=function(){e.infoWindow.options.show=!1},i.then(function(i){return e.map={center:{latitude:33.7764,longitude:-84.3985},zoom:16,options:e.mapOptions},o.all()}).then(function(i){n.buildings=[],i.data.forEach(function(i){e.safeBuildings.push(i),i.show_on_map&&n.buildings.push(i)});for(var o=function(i,o){var t={id:i,coords:{latitude:o.latitude,longitude:o.longitude},options:{title:o.name,labelContent:o.abbreviation}};return o.occupancy<=40?t.icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png":o.occupancy<=80?t.icon="http://maps.google.com/mapfiles/ms/icons/yellow-dot.png":t.icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png",t.onClick=function(){a.log(t.options.title+" clicked!"),e.$apply(function(){e.selectedMarker=t,e.infoWindow.templateParameter.title=t.options.title,e.infoWindow.templateParameter.occupancy=n.buildings[t.id].occupancy,console.log("marker id",t.id),console.log("bid",n.buildings[t.id].bid),e.infoWindow.templateParameter.building_id=n.buildings[t.id].bid,e.infoWindow.options.show=!0})},t},t=0;t<n.buildings.length;t++)e.markers.push(o(t,n.buildings[t]))})["catch"](function(){a.log("Error occurred, see logs.")}).then(function(){n.processing=!1})}]),angular.module("buildingService",[]).factory("Building",["$http","$log",function(e,i){var o={};return o.all=function(){return e.get("/api/buildings")},o.get=function(i){return e.get("/api/buildings/"+i)},o.graphdata=function(i){return e.get("/api/graphdata/"+i)},o.getFloors=function(i){return e.get("/api/buildings/"+i)},o}]);