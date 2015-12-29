// To run: node server.js

global.hostname = require('os').hostname();
global.port = 8080;
global.cache_time_to_live = 5 * 60 * 1000; // 5 minutes
global.count = {};
global.occupancies = {};

// Import List of Buildings and Rooms
global.buildings_rooms = JSON.parse(getBuildingRoomsTextFile());

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

// import http module
global.http = require('http');

// Documentation for API
app.get('/api/', function (request, response) {
	var html = getAPIIndexPage();
	response.send(html);
});

// Get all buildings for angular app
app.get('/api/angular/buildings', function(req, res) {
	Building.find(function(err, buildings) {
		if (err) res.send(err);

		// return the buildings
		res.json(buildings);
	});
});

// Array of all Buildings (b_id, name)
app.get('/api/buildings', function (request, response) {
	// cached from http://m.gatech.edu/widget/gtplaces/content/api/buildings
	var json = getBuildingsTextFile();
	response.send(json);
});

app.get('/api/floors', function (request, response) {
	var json = getBuildingFloorsTextFile();
	response.send(json);
});

// Array of all Rooms (b_id, name)
app.get('/api/rooms', function (request, response) {
	var json = getBuildingRoomsTextFile();
	response.send(json);
});

// Array of rooms for specific b_id
app.get('/api/rooms/:str', function (request, response) {
	var str = request.params.str;
	var b_id = str.substring('b_id='.length);

	var rooms = getBuildingObject(b_id);

	if (rooms != undefined) {
		response.send(rooms);
	} else {
		response.send({});
	}
});

// Location info of All Buildings
app.get('/api/locationinfo/buildings', function (request, response) {
	
	// Get Building ids
	var buildings = (JSON.parse(getBuildingsTextFile())).buildings;

	var type_of_request = 'buildings';
	requestOccupancies(response, buildings, type_of_request);
});

// Location info of All Floors
app.get('/api/locationinfo/floors', function (request, response) {

	var uri = '/api/locationinfo/rooms';
	var url = 'http://' + global.hostname + ':' + global.port + uri;
	
	global.count['floors'] = 0;
	global.occupancies['floors'] = {};
		
	global.http.get(url, function(res) {

		var data = '';
		res.on('data', function (chunk) {
			data += chunk;
		});

		res.on("end", function () {

			var occupancies = {};

			var rooms = JSON.parse(data)['occupancies'];

			var buildings = JSON.parse(getBuildingRoomsTextFile())['buildings'];
			for (var i = 0; i < Object.keys(buildings).length; i++) {
				var b_id = Object.keys(buildings)[i];
				
				for (var j = 0; j < buildings[b_id]['floors'].length; j++) {
					var floor = buildings[b_id]['floors'][j];

					var total_occupancy = 0;
					for (var k = 0; k < buildings[b_id][floor].length; k++) {
						var room = buildings[b_id][floor][k];

						var ap = b_id + '-' + room;

						if (ap in rooms) {
							total_occupancy += rooms[ap]['occupancy'];
						}
					}
					occupancies[b_id + '_' + floor] = {};
					occupancies[b_id + '_' + floor] = total_occupancy;
				}
			}
			var final_json = {};
			final_json.occupancies = occupancies;
			response.send(final_json);
		});
	});
});

// Location info of All Rooms
app.get('/api/locationinfo/rooms', function (request, response) {

	// Get Building/Room ids [b_id-room, ...]
	var buildings = (JSON.parse(getBuildingRoomsTextFile())).buildings;
	
	var rooms_list = [];
	for (var i = 0; i < buildings.length; i++) {
		for (var j = 0; j < buildings[i].rooms.length; j++) {
			rooms_list.push(buildings[i].b_id + '-' + buildings[i].rooms[j]);
		}
	}

	var type_of_request = 'rooms';
	requestOccupancies(response, rooms_list, type_of_request);
});

// Location info of All Buildings and rooms
app.get('/api/locationinfo/all', function (request, response) {

	var uris = ['/api/locationinfo/buildings', '/api/locationinfo/rooms'];
	
	var url = 'http://' + global.hostname + ':' + global.port;

	global.count_all = 0;
	global.occupancies['all'] = {};

	for (var i = 0; i < uris.length; i++) {
		global.http.get(url + uris[i], function(res) {

			var data = '';
			res.on('data', function (chunk) {
				data += chunk;
			});

			res.on("end", function() {
				global.count_all++;
				var locationinfo_obj = JSON.parse(data);
				for (id in locationinfo_obj.occupancies) {
					global.occupancies['all'][id] = locationinfo_obj.occupancies[id];
				}

				if (global.count_all == uris.length) {
					var final_json = {};
					final_json.occupancies = global.occupancies['all'];
					response.send(final_json);
				}
			});
		});
	}
});

app.get('/api/locationinfo/:str', function (request, response) {
	var str = request.params.str;

	/* Parse Input String */
	var buildings = parseBuildingString(str);

	/* Request Location Info for each building
	 * TODO: Reuqest location info for room */
	var uri = '/api/locationinfo/all';
	var url = 'http://' + global.hostname + ':' + global.port + uri;

	global.http.get(url, function(res) {

		var data = '';
		res.on('data', function (chunk) {
			data += chunk;
		});

		res.on("end", function() {
			var occ_list = JSON.parse(data);

			var occupancies = {};
			var total_occupancy = 0;
			for (var i = 0; i < buildings.length; i++) {

				var occupancy,
					id = buildings[i].b_id;
				if (typeof(buildings[i].room) !== 'undefined') {
					id += '-' + buildings[i].room;
				}
				try {
					occupancy = occ_list.occupancies[id].occupancy;
				} catch (err) {
					occupancy = 0;
				}

				var json = {};
				json.b_id = buildings[i].b_id;
				json.occupancy = occupancy;

				if (typeof(buildings[i].room) !== 'undefined') {
					json.room = buildings[i].room;
				}
				
				// Store the id of the location_obj as a key
				occupancies[id] = json;

				// Count all the occupancies 
				total_occupancy += occupancy;
			}
			var final_json = {};
			final_json.total_occupancy = total_occupancy;
			final_json.occupancies = occupancies;
			response.send(final_json);
		});
	});
});

// Historicl data {date: [crowd-level at hours-of-day]}
app.get('/api/predict', function (request, response) {

	var buildings = (JSON.parse(getHistoricalDataTextFile()));

	response.send(buildings);
});

// b_id=XXX-[00, 01, 02, ..]
app.get('/api/predict/:str', function (request, response) {
	var buildings = (JSON.parse(getHistoricalDataTextFile())),
		input = request.params.str.split("-"),
		raw_b_id = input[0].split("="),
		output = {};

	if (input.length != 2 || raw_b_id.length != 2) {
		// bad request
		console.log('bad');
		output.b_id = '000';
		output.hours = [];
	} else {

		output.b_id = raw_b_id[1];

		if (buildings[output.b_id] == undefined) {
			// bad request
			output.hours = [];
		} else {
			var input_hours = input[1].substring(1, input[1].length - 1).split(',');
			
			// Input strings to int
			for (var i = 0; i < input_hours.length; i++) {
				input_hours[i] = parseInt(input_hours[i]);
			}

			// get prediction rest of day percentage weighted (tested in matcher.py)
			var prediction = getPredictionRestOfDayPercentageWeighted(buildings[output.b_id], output.b_id, input_hours, true);
			output.hours = prediction.rod;
			output.similar_date = prediction.similar_date;
			output.variance = prediction.variance;
		}
	}

	response.send(output);
});

// MAIN CATCHALL ROUTE ---------------
// SEND USERS TO FRONTEND ------------
app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

/* * * * * * * * * * 
 * HTTP Requests
 * * * * * * * * * */

function requestOccupancies(response, location_list, type_of_request) {

	var isCacheExpired = true,
		current_time = new Date().getTime(),
		txt,
		cached_timestamp;
	try {
		txt = readCachedOccupancies(type_of_request);
		cached_timestamp = (JSON.parse(txt)).timestamp;
		
		if (cached_timestamp + global.cache_time_to_live < current_time) {
			console.log('Cache Expired. Requesting GTWhereAmI: ' + type_of_request);
		} else {
			isCacheExpired = false;
			console.log('Cached Response: ' + type_of_request);
			response.send(txt);
		}
	} catch (err) {
		console.log(err);
		cached_timestamp = 0;
	}
	
	if (isCacheExpired) {
		// API for locations
		var gtwhereami = 'http://gtwhereami.herokuapp.com/';
		
		var uri, bid, room;
		if (type_of_request == 'buildings') {
			uri = 'locationinfo?bid=';

			// Generate Global Associative Array for reference in Asynch call
			global.buildings = [];
			for (var i = 0; i < location_list.length; i++) {
				global.buildings['b_id: ' + location_list[i].b_id] = location_list[i].name;
			}
		} else if (type_of_request == 'rooms') {
			uri = '/locationinfo?';
			bid = 'bid=';
			room = '&room=';
		}


		// Loop through all building id's and request locationinfo
		for (var i = 0; i < location_list.length; i++) {

			// Global Variables to keep track of asynchronous calls
			global.occupancies[type_of_request] = {};
			global.count[type_of_request] = 0;

			// Custom URL structure for type_of_request
			var url, b_id, room_no;
			if (type_of_request == 'buildings') {
				url = gtwhereami + uri + location_list[i].b_id;
			} else if (type_of_request == 'rooms') {
				b_id = location_list[i].split("-")[0];
				room_no = location_list[i].split("-")[1];
				url = gtwhereami + uri + bid + b_id + room + room_no;
			}

			global.http.get(url, function(gtwhereami_response) {

				// Get building id from the socket of the asynchronous call (really struggled trying to figure this out, probably a better way)
				var b_id, room;
				if (type_of_request == 'buildings') {
					b_id = gtwhereami_response.socket._httpMessage.path.substring(uri.length + 1);
				} else if (type_of_request == 'rooms') {
					var raw_b_id_room = gtwhereami_response.socket._httpMessage.path.substring('/locationinfo?bid='.length + 1).split("&");
					
					b_id = raw_b_id_room[0];
					room = raw_b_id_room[1].substring('room='.length);
				}

				var occupancy = '';
				gtwhereami_response.on('data', function (chunk) {
					occupancy += chunk;
				});

				gtwhereami_response.on('end', function () {

					// Occupancy returned, count until all are returned
					var occ;
					try {
					    occ = (JSON.parse(occupancy)).occupancy;
					} catch(err) {
					    occ = '';

					    var log;
					    if (type_of_request == 'buildings') {
					    	log = 'Bad Request: ' + b_id;
					    } else if (type_of_request == 'rooms') {
					    	log = 'Bad Request: ' + b_id + '-' + room;
					    }
					    console.log(log);
					}

					var json_obj = {};
					json_obj.b_id = b_id;
					json_obj.occupancy = occ;
					
					if (type_of_request == 'buildings') {
				    	json_obj.name = global.buildings['b_id: ' + b_id];
				    	
				    	// Push building object to global array
				    	global.occupancies[type_of_request][b_id] = json_obj;
				    } else if (type_of_request == 'rooms') {
				    	var ap = b_id + '-' + room;
				    	json_obj.ap = ap;
						json_obj.room = room;

						// Push building object to global array
						global.occupancies[type_of_request][ap] = json_obj;
				    }
					global.count[type_of_request]++;
					// console.log(global.count[type_of_request] + '?=' + location_list.length);

					// Return json string when all occupancy requests have terminated
					if (global.count[type_of_request] >= location_list.length) {

						var final_json = {};
						final_json.timestamp = new Date().getTime();
						final_json.occupancies = global.occupancies[type_of_request];
						cacheOccupancies(type_of_request, final_json); // Write occupancies to text file
						console.log('send: ' + type_of_request);
						response.send(final_json);
						console.log('Occupancies Request Complete: ' + type_of_request);
						global.count[type_of_request] = 0;
					}
				});
			});
		}
	}
}

/* * * * * * * * * * * * *
 * Helper Functions 
 * * * * * * * * * * * * */

function readFromTextFile(filename) {
	var fs  = require("fs");
	var txt = fs.readFileSync(filename).toString();
	return txt;	
}

function getBuildingsTextFile() {
	var filename = 'buildings.txt';
	var txt = readFromTextFile(filename);
	return txt;
}

function getBuildingFloorsTextFile() {
	var filename = 'floors.txt';
	var txt = readFromTextFile(filename);
	return txt;
}

function getBuildingRoomsTextFile() {
	var filename = 'rooms.txt';
	var txt = readFromTextFile(filename);
	return txt;
}

function getAPIIndexPage() {
	var filename = 'APIDocumentation.html';
	var txt = readFromTextFile(filename);
	return txt;
}

function getHistoricalDataTextFile() {
	var filename = 'JanFebMarApr2015_matcher.txt';
	var txt = readFromTextFile(filename);
	return txt;
}

function writeToTextFile(filename, data) {
	var fs  = require("fs");
	fs.writeFile(filename, data, function(err) {
	    if(err) {
	        return console.log(err);
	    }
	    console.log('Saved: ' + filename);
	}); 
}

function cacheOccupancies(type_of_request, data) {
	var filename = 'cache/cached_occupancies_' + type_of_request + '.txt';
	writeToTextFile(filename, JSON.stringify(data));
}

function readCachedOccupancies(type_of_request) {
	var filename = 'cache/cached_occupancies_' + type_of_request + '.txt';
	return readFromTextFile(filename);
}

// Parse dynamic endpoint return array of buildings (i.e. b_id=81&b_id=33 => [b_id: 81, b_id: 33])
function parseBuildingString(str) {
	var tokens = str.split("&");
	var buildings = [];

	for (var i = 0; i < tokens.length; i++) {
		if (tokens[i].split("=").length === 2 && tokens[i].split("=")[0] === "b_id") {

			// i.e. [b_id, 81-337] or [b_id, 81]
			var bid_raw_array = tokens[i].split("=");

			// i.e. [81] or [81, 337]
			var bid = bid_raw_array[1],
				bid_room = bid_raw_array[1].split("-"),
				bid_floor = bid_raw_array[1].split("_");
			
			var building = {};

			var b_id, room, floor;
			if (bid_room.length > bid_floor.length) {
				b_id = bid_room[0];
				room = bid_room[1];
				
				if (bid_room.length == 2  && b_id != '') {
					building.b_id = b_id;
					building.room = room;

					buildings.push(building);
				} // else bad request
			} else if (bid_room.length < bid_floor.length) {
				// floors
				b_id = bid_floor[0];
				floor = bid_floor[1];

				// Find the correct building
				var building_obj = getBuildingObject(b_id);
				
				// Add all the rooms on the floor to the buildings array
				for (var i = 0; i < building_obj[floor].length; i++) {
					buildings.push({'b_id': b_id,
									'room': building_obj[floor][i]});
				}
			} else if (bid_room.length == bid_floor.length && bid_room.length == 1) {
				// just b_id
				building.b_id = bid;

				buildings.push(building);
			} // else bad request
		} else {
			// bad request
			console.log('Bad Request: ' + str);
			buildings = [];
			break;
		}
	}
	return buildings;
}

function getBuildingObject(b_id) {
	var building_obj;
	for (var i = 0; i < global.buildings_rooms.buildings.length; i++) {
		if (b_id === global.buildings_rooms.buildings[i].b_id) {
			building_obj = global.buildings_rooms.buildings[i];
			break;
		}
	}
	return building_obj;
}

// Find least different day based off least different unique users at each hour
// Calculate difference as a percentage
function getPredictionRestOfDayPercentageWeighted(building_dates, b_id, hours, test) {
	var least_diff = Number.MAX_VALUE,
		predicted_day = [],
		prediction = {}
		prediction.rod = [],
		prediction.similar_date = 0,
		prediction.variance = 0;

	var dates = Object.keys(building_dates).sort();
	for (var i = 0; i < dates.length; i++) {
		if (test)
			console.log(dates[i]);

		var diff = 0;
		for (var hour = 0; hour < hours.length; hour++) {
			if (test)
				console.log('\t' + building_dates[dates[i]][hour]);

			var weight = hour + 1 // index
			diff += weight * Math.abs(hours[hour] - building_dates[dates[i]][hour]) / hours[hour];
		}

		if (test)
			console.log('\t\t' + diff);

		if (diff < least_diff) {
			least_diff = diff;
			prediction.similar_date = dates[i];
			prediction.rod = building_dates[dates[i]].slice(hours.length)
			prediction.variance = parseFloat(least_diff.toFixed(2));
		}
	}

	if (test)
		console.log(prediction.similar_date + '\n' + prediction.variance);

	return prediction;
}