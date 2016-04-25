// Database models
var Building = require('../models/building');
var Floor = require('../models/floor');
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var History = require('../models/history');
var moment = require('moment');

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
		console.log('floors requested');
		Floor.find({ bid: req.params.bid }, function(err, floors) {
			if (err) res.send(err);

			// return floors
			res.json(floors);
		});
	});

	// returns {today: [], averages: []} where each contained array contains 24
	// data points - one corresponding to each hour of the day
	apiRouter.get('/graphdata/:bid', function(req, res) {
		History.findOne({bid: req.params.bid }, function(err, history) {
			if (err) return handleError(err);

			if (history == null) {
				res.sendStatus(404);
				return;
			}

			// keep track of counts and number of values to calculate averages
			var totals = {};
			var counts = {};

			// values indexed by hour (0-23)
			var todayEntries = {};

			// the beginning and end of today
			var lowerBound = moment().startOf('day');
			var upperBound = moment().endOf('day');

			// tally up total counts for each data point we have
			history.history.forEach(function(val) {
				var date = moment(val.createdAt);

				// round to the nearest hour
				var nearestHour = date.startOf('hour').hours();

				if (!(nearestHour in totals)) {
					totals[nearestHour] = 0;
					counts[nearestHour] = 0;
				}
				totals[nearestHour] += val.occupancy;
				counts[nearestHour] += 1;

				// make sure date is today
				if (lowerBound.isBefore(date) && date.isBefore(upperBound)) {
					if (!(nearestHour in todayEntries)) {
						todayEntries[nearestHour] = val.occupancy;
					}
				}
			});

			var averages = [];
			var today = [];

			// calculate averages from counts
			for (var i = 0; i < 24; i++) {
				if (i in totals) {
					averages.push(Math.round(totals[i] / counts[i]));
				} else {
					averages.push(0);
				}

				if (i in todayEntries) {
					today.push(todayEntries[i]);
				} else {
					today.push(0);
				}
			}


			res.json({today: today, averages: averages});
		});
	});

	// returns a list of all occupancy data points we have in the database for a given building
    apiRouter.get('/timeseries/:bid', function(req, res) {
        History.findOne({bid: req.params.bid }, function(err, history) {
            if (err) return handleError(err);

			if (history == null) {
				res.sendStatus(404);
				return;
			}

			var totals = {};

                var data = [];
                history.history.forEach(function(val) {
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
