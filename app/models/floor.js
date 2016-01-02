var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// floor schema 
var FloorSchema = new Schema({
	floor: String,
	bid: Number,
	occupancy: Number,
	capacity: Number },
	{ timestamps: true } 
);

module.exports = mongoose.model('Floor', FloorSchema);