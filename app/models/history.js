var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SubHistorySchema = new Schema({
    occupancy: Number },
    { timestamps: true } 
);

// History schema  
var HistorySchema = new Schema({
	name: String,
	bid: Number,
	history : [SubHistorySchema] },
	{ timestamps: true } 
);

module.exports = mongoose.model('History', HistorySchema);