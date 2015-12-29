angular.module('gthiveApp', ['app.routes', 'mainCtrl', 'buildingService', 'uiGmapgoogle-maps'])

.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'geometry,visualization'
    });
});