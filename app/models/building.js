var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// building schema 
var BuildingSchema = new Schema({
	name: String,
	bid: Number,
	occupancy: Number,
	capacity: Number,
	latitude: Number,
	longitude: Number },
	{ timestamps: true } 
);

module.exports = mongoose.model('Building', BuildingSchema);