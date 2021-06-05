const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'The tour must have a name. This field is mandatory'],
		unique: true,
	},
	rating: {
		type: Number,
		default: 1,
	},
	price: {
		type: Number,
		required: [true, 'The tour must have a price greater than zero.'],
	},
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
