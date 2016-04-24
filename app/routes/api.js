// Database models
var Building = require('../models/building');
var Floor = require('../models/floor');
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));

module.exports = function(app, express) {

	var apiRouter = express.Router();

	// Routes that end in /buildings
	apiRouter.get('/buildings', function(req, res) {
		Building.find(function(err, buildings) {
			if (err) res.send(err);

			// return the buildings
			res.json(buildings);
		});
	});

	// Routes that end in /buildings/:bid
	// Get the floors of the building with that bid
	apiRouter.get('/buildings/:bid', function(req, res) {
		Floor.find({ bid: req.params.bid }, function(err, floors) {
			if (err) res.send(err);

			// return floors
			res.json(floors);
		});
	});

	// proxy api requests to rnoc via vpn so the app can get results without being on the gatech network
	apiRouter.get('/proxy', function(req, res) {
		var url = 'http://wifi.dssg.rnoc.gatech.edu:3000/api/count?details=true';
		console.log("making proxy request to rnoc api");
		request.getAsync(url).then(function(apiRes) {
			console.log("got response from rnoc api");
			res.send(apiRes.body);
		});
	});

	return apiRouter;
};
