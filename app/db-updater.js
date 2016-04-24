// Get modules 
var CronJob = require('cron').CronJob;
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var Building = require('./models/building');
Promise.promisifyAll(Building);
Promise.promisifyAll(Building.prototype);
var History = require('./models/history');
Promise.promisifyAll(History);
Promise.promisifyAll(History.prototype);

module.exports = new CronJob('0 */1 * * * *', function() {
	console.log('Job Starting');

	// Array of bids
	var bids = [
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
	var url = 'http://wifi.dssg.rnoc.gatech.edu:3000/api/count/building_id=';

	bids.forEach(function(bid) {
		// Get the current occupancy of the building 
	  	request.getAsync(url + bid).then(function(res) {
	  		// Parse the response into JSON
	  		return JSON.parse(res.body);

	  	}).then(function(parsed) {
	  		// Update the historical data
	  		History.findOne({ bid: bid }, function (err, building) {
	  			if (err) return handleError(err);

	  			building.history.push({ occupancy: parsed.clientcount });

	  			building.save(function (err) {
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

	  	}).catch(function(err) {
	  		// Catch any error that happened along the way
	  		console.log('Error occured:', err);
	  	});
	});
	
}, null, false, 'America/New_York'); 