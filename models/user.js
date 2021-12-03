const mongoose = require('mongoose');

//name, email, photo, pass, passconfirm
const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'The user must have a name. This field is mandatory'],
			unique: true,
			trim: true,
			minLength: [10, 'The user name must have 10 characters at least'],
			validate: {
				validator: function (value) {
					return /^[\D]+$/.test(value);
				},
				message: 'The user name must only contains letters.',
			},
		},
		email: {
			type: String,
			required: [
				true,
				'The user must have a valid e-mail address. This field is mandatory',
			],
			unique: true,
			trim: true,
		},
		password: {
			type: String,
			required: [true, 'The user must have a password.'],
			minLength: [8, 'The password must be 8 characters or longer'],
		},
		maxGroupSize: {
			type: Number,
			required: [
				true,
				'The tour must have a group size of 1 min and 25 max.',
			],
		},
		difficulty: {
			type: String,
			required: [true, 'The tour must have a difficulty'],
			lowercase: true,
			enum: {
				values: ['easy', 'medium', 'difficult'], //video 107
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
		priceDiscount: {
			type: Number,
			validate: {
				validator: function (value) {
					//this solamente es válido en la creación de nuevos documnentos (no update)
					return this.price > value;
				},
				message: (props) =>
					`The discount of the tour (${props.value}) must be lower than the price`,
			},
		},
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
			select: false, //si no queremos que este campo aparezca en ninguna busqueda
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

const User = mongoose.model('Tour', userSchema);

module.exports = User;
