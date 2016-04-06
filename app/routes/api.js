// Database models
var Building = require('../models/building');
var Floor = require('../models/floor');

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

	return apiRouter;
};