// BASE SETUP =========================
// ====================================

// Get packages
var express    = require('express');		
var app        = express(); 				// define our app using express
var mongoose   = require('mongoose');
var config 	   = require('./config');
var path 	   = require('path');

// APP CONFIGURATION ==================
// ====================================

// Connect to database
mongoose.connect(config.database); 

// Set static files location
// Used for requests that our frontend will make
app.use(express.static(__dirname + '/public'));

// Configure app to handle CORS requests
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});

// UPDATE DATABASE EVERY 5 MIN ========
// ====================================
var dbUpdater = require('./app/db-updater');
// dbUpdater.start();

// ROUTES FOR OUR API =================
// ====================================

var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);

// MAIN CATCHALL ROUTE --------------- 
// SEND USERS TO FRONTEND ------------
app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

// START THE SERVER ===================
// ====================================

app.listen(config.port);