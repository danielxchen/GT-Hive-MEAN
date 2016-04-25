// Database models
var Building = require('../models/building');
var Floor = require('../models/floor');
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var History = require('../models/history');

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

	apiRouter.get('/historic/:bid', function(req, res) {
		Building.find({ bid: req.params.bid }, function(err, floors) {
			if (err) res.send(err);
			console.log("Building Data")
			// return floors
			res.json([4,6,1,9,20,30,5,12,14,45,9,20,10,12,10,45,23,09,32,12,34,67,12,23]);
		});
	});

	apiRouter.get('/timeseries/:bid', function(req, res) {
		History.findOne({bid: req.params.bid }, function(err, history) {
			if (err) return handleError(err);

			var data = [];
			history.history.forEach(function(val) {
				// console.log(val);
				data.push({date: val.createdAt, occupancy: val.occupancy})
			});

			res.json(data);
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
