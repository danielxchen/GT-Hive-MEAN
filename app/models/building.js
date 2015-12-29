var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// building schema 
var BuildingSchema = new Schema({
	name: String,
	bid: Number,
	occupancy: Number,
	capacity: Number,
	floors: [Number],
	latitude: Number,
	longitude: Number
});

module.exports = mongoose.model('Building', BuildingSchema);