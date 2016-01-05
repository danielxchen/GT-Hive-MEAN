// Get modules 
var CronJob = require('cron').CronJob;
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var Building = require('./models/building');
Promise.promisifyAll(Building);
Promise.promisifyAll(Building.prototype);

module.exports = new CronJob('* */5 * * * *', function() {
	console.log('Job Starting');

	// Get the current occupancy of the building 
  	var url = 'http://gtwhereami.herokuapp.com/locationinfo?bid=166';
  	request.getAsync(url).then(function(res) {
  		// Parse the response into JSON
  		return JSON.parse(res.body);

  	}).then(function(parsed) {
  		// Update the building's occupancy
  		return Building.findOneAndUpdateAsync({ bid: 166 }, { $set: { occupancy:parsed.occupancy } }, { new: true });

  	}).then(function(doc) {
  		// We got the updated document
  		console.log(doc);

  	}).catch(function(err) {
  		// Catch any error that happened along the way
  		console.log('Error occured:', err);
  	});

}, null, true, 'America/New_York');