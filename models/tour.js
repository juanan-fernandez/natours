const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'The tour must have a name. This field is mandatory'],
			unique: true,
			trim: true,
		},
		slug: String,
		duration: {
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
		vip: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

tourSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

//query middleware
//tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
	//todas las instrucciones que empiezen por find (find, findOne,...)
	this.find({ vip: { $ne: true } });
	this.startQuery = Date.now();
	next();
});

tourSchema.post(/^find/, function (next) {
	console.log(`The query has finished in ${Date.now() - this.startQuery} ms.`);
});

//Aggregation middleware
tourSchema.pre('aggregate', function (next) {
	this.pipeline().unshift({ $match: { vip: { $ne: true } } });
	console.log(this.pipeline());
	next();
});

//Virtual
tourSchema.virtual('durationWeeks').get(function () {
	return this.duration / 7;
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
