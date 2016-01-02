// Database models
var Building = require('../models/building');

module.exports = function(app, express) {

	var apiRouter = express.Router();

	// Get all buildings 
	app.get('/buildings', function(req, res) {
		Building.find(function(err, buildings) {
			if (err) res.send(err);

			// return the buildings
			res.json(buildings);
		});
	});

	return apiRouter;
};