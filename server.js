// BASE SETUP =========================
// ====================================

// Get packages
var express    = require('express');		
var session    = require('express-session');
var app        = express(); 				// define our app using express
var mongoose   = require('mongoose');
var config 	   = require('./config');
var path 	   = require('path');
var CASAuth        = require('cas-authentication');

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
dbUpdater.start();

// Setup CAS
// See this url for more info: https://www.npmjs.com/package/cas-authentication
// ====================================
app.use(session({
    secret: 'super secret key', // TODO(justin): fix
    resave: false,
    saveUninitialized: true
}));

var cas = new CASAuth({
    cas_url: 'https://login.gatech.edu/cas',
    service_url: 'http://gthive.me', // TODO(justin): pull dynamically so we can have testing subdomains?
    session_name: 'cas_user',
    session_info: 'cas_userinfo',
    destroy_session: false
});

// ROUTES FOR OUR API =================
// ====================================

var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);

// MAIN CATCHALL ROUTE --------------- 
// SEND USERS TO FRONTEND ------------
// Unauthenticated clients will be redirected to the CAS login and then back to 
// this route once authenticated. 
app.get('/', cas.bounce, function(req, res) {
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

// Unauthenticated clients will be redirected to the CAS login and then to the 
// provided "redirectTo" query parameter once authenticated. 
app.get('/authenticate', cas.bounce_redirect);

// This route will de-authenticate the client with the Express server and then 
// redirect the client to the CAS logout page. 
app.get('/logout', cas.logout);

// START THE SERVER ===================
// ====================================

app.listen(config.port);