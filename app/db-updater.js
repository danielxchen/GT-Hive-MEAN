var CronJob = require('cron').CronJob;
var Promise = require("bluebird");
var Building = require('../models/building');
Promise.promisifyAll(require("request"));
Promise.promisifyAll(Building);
Promise.promisifyAll(Building.prototype);

module.exports = new CronJob('* * * * * *', function() {

  console.log('You will see this message every second');

}, null, false, 'America/New_York');