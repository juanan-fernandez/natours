const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'The tour must have a name. This field is mandatory'],
			unique: true,
			trim: true,
		},
		durations: {
			type: Number,
			requiered: [true, 'The tour must have a duration of 1 day min.'],
			min: 1,
		},
		maxGroupSize: {
			type: Number,
			requiered: [
				true,
				'The tour must have a group size of 1 min and 25 max.',
			],
		},
		difficulty: {
			type: String,
			required: [true, 'The tour must have a difficulty'],
			enum: {
				values: ['easy', 'medium', 'difficult'],
				message: 'Difficulty is either: easy, medium, difficult',
			},
		},
		ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [1, 'Rating must be above 1.0'],
			max: [5, 'Rating must be below 5.0'],
		},
		ratingsQuantity: {
			type: Number,
			default: 0,
		},
		rating: {
			type: Number,
			default: 1,
		},
		price: {
			type: Number,
			required: [true, 'The tour must have a price greater than zero.'],
			min: 1,
		},
		priceDiscount: Number,
		summary: {
			type: String,
			trim: true,
		},
		description: {
			type: String,
			trim: true,
			required: [true, 'The tour must have a description'],
		},
		imageCover: {
			type: String,
			required: [true, 'The tour must have a cover image'],
		},
		images: [String],
		startDates: [Date],
	},
	{
		timestamps: true,
	},
);

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
