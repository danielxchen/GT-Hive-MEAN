global.hostname = require('os').hostname();
global.port = 8080;
global.cache_time_to_live = 5 * 60 * 1000; // 5 minutes
global.count = {};
global.occupancies = {};

/* Configure Express with Node */

var express = require('express');
var app = express();

// Path variable
var path = require('path');

// Database
var mongoose = require('mongoose');
mongoose.connect('mongodb://admin:password@ds035623.mongolab.com:35623/gt_hive'); 
var Building = require('./app/models/building');

// set static files location
// used for requests that our frontend will make
app.use(express.static(__dirname + '/public'));

// Configure app to handle CORS requests
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});

/* Run App */

app.listen(global.port);

/* * * * * * * * * * * * *
 * API End Points 
 * * * * * * * * * * * * */

// Get all buildings for angular app
app.get('/api/angular/buildings', function(req, res) {
	Building.find(function(err, buildings) {
		if (err) res.send(err);

		// return the buildings
		res.json(buildings);
	});
});