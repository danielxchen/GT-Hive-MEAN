// Get modules 
var CronJob = require('cron').CronJob;
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var async = require('async');

var Building = require('./models/building');
Promise.promisifyAll(Building);
Promise.promisifyAll(Building.prototype);

var Floor = require('./models/floor');
Promise.promisifyAll(Floor);
Promise.promisifyAll(Floor.prototype);

var History = require('./models/history');
Promise.promisifyAll(History);
Promise.promisifyAll(History.prototype);

module.exports = new CronJob('0 */5 * * * *', function() {
	console.log('Job Starting');

	// Array of bids
	var bids = [
	    850,
	    131,
	    865,
	    327,
	    172,
	    171,
	    325,
	    316,
	    323,
	    331,
	    174,
	    321,
	    155,
	    328,
	    170,
	    103,
	    108,
	    320,
	    333,
	    142,
	    307,
	    151,
	    123,
	    164,
	    111,
	    326,
	    177,
	    146,
	    105,
	    100,
	    303,
	    165,
	    118,
	    315,
	    311,
	    300,
	    308,
	    720,
	    324,
	    181,
	    147,
	    334,
	    335,
	    158,
	    126,
	    128,
	    167,
	    138,
	    184,
	    337,
	    319,
	    173,
	    175,
	    310,
	    136,
	    302,
	    104,
	    134,
	    178,
	    322,
	    305,
	    107,
	    117,
	    304,
	    149,
	    152,
	    330,
	    109,
	    144,
	    336,
	    110,
	    106,
	    309,
	    156,
	    129,
	    137,
	    201,
	    312,
	    176,
	    101,
	    139,
	    145,
	    200,
	    198,
	    314,
	    338,
	    318,
	    115,
	    119,
	    317,
	    124,

		160,
		166,
		77,
		12,
		153,
		50,
		81,
		85,
		55,
		114,
		116, // woodruff dining
		135, // mrdc
		17	// bobby dodd
	];

	// Base url
	// var url = 'http://gtwhereami.herokuapp.com/locationinfo?bid=';
	// var url = 'http://wifi.dssg.rnoc.gatech.edu:3000/gtwhereami/locationinfo?bid=';
	var url = 'http://wifi.dssg.rnoc.gatech.edu:3000/api/count';

	// leading zero for double-digit building ids or else rnoc api won't work
	function stringBid(bid) {
		var strBid = bid.toString();
		if (strBid.length == 2) {
			strBid = "0" + strBid;
		}
		return strBid;
	}


	function update_building(bid, callback) {
		var strBid = stringBid(bid);

		// Get the current occupancy of the building 
	  	request.getAsync(url + '/building_id=' + strBid).then(function(res) {
	  		// Parse the response into JSON
	  		return JSON.parse(res.body);

	  	}).then(function(parsed) {
	  		// Update the historical data
	  		History.findOne({ bid: bid }, function (err, history) {
	  			if (err) return handleError(err);

	  			if (history == null) {
	  				console.log("history not found for id", bid);
	  				history = new History();
	  				history.bid = bid;
	  			}

	  			history.history.push({ occupancy: parsed.clientcount });

	  			history.save(function (err) {
  					if (err) return handleError(err)
  					console.log(bid, 'history updated!');
				});

			});

	  		return parsed;
	  	}).then(function(parsed) {
	  		// Update the building's occupancy
	  		return Building.findOneAndUpdateAsync({ bid: bid }, { $set: { occupancy: parsed.clientcount } }, { new: true });

	  	}).then(function(doc) {
	  		// We got the updated document
	  		console.log(bid, 'updated!');

	  		// tell async we're done
	  		callback();

	  		return null
	  	}).catch(function(err) {
	  		// Catch any error that happened along the way
	  		console.log('Error occured:', err);

	  		// tell async we're done
	  		callback();
	  		return null;
	  	});
	}

	var queue = async.queue(update_building, 5); // 5 simultaneous requests
	queue.drain = function() {
		console.log("Done updating buildings");
	};
	queue.push(bids);


	function update_floors() {
		request.getAsync(url + '?details=true').then(function(res) {
			return JSON.parse(res.body);
		}).then(function(parsed) {
			var aps = parsed['AccessPoints'];

            // sum floor data
            // example: floorData[building_id][floor] = count
            var floorData = {};
            aps.forEach(function(ap) {
                if (!(ap.building_id in floorData)) {
                    floorData[ap.building_id] = {};
                }

                if (!(ap.floor in floorData[ap.building_id])) {
                    floorData[ap.building_id][ap.floor] = 0;
                }

                floorData[ap.building_id][ap.floor] += ap.clientcount;
            });

            // update database, adding new Floor records when necessary
            for (var bidStr in floorData) {
                var bid = parseInt(bidStr);
                if (!isNaN(bid)) {
                    var floors = floorData[bidStr];
                    for (var floorName in floors) {
                        var count = floors[floorName];
                        Floor.findOneAndUpdateAsync({ bid: bid, floor: floorName },
                            { $set: { occupancy: count } }, { new: true, upsert: true });
                    }
                }
            }

            console.log(floorData);

		});
	}

    update_floors();

	
}, null, false, 'America/New_York');
