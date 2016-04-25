var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// building schema 
var BuildingSchema = new Schema({
	name: String,
	abbreviation: String,
	bid: String,
	occupancy: Number,
	capacity: Number,
	latitude: Number,
    show_on_map: Boolean,
	longitude: Number },
	{ timestamps: true } 
);

module.exports = mongoose.model('Building', BuildingSchema);