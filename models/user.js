const mongoose = require('mongoose');
const validator = require('validator');

//name, email, photo, pass, passconfirm
const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'The user must have a name. This field is mandatory'],
			trim: true,
			validate: {
				validator: function (value) {
					return /^[\D]+$/.test(value);
				},
				message: 'The user name must only contains letters.',
			},
		},
		email: {
			type: String,
			required: [true, 'The user must have a valid e-mail address.'],
			unique: true,
			lowercase: true,
			trim: true,
			validate: [
				validator.isEmail,
				'The provided e-mail address is not valid.',
			],
		},
		password: {
			type: String,
			required: [true, 'The user must have a password.'],
			minLength: [8, 'The password must be 8 characters or longer'],
		},
		passwordConfirm: {
			type: String,
			required: [true, 'The password confirmation is a mandatory.'],
			minLength: [8, 'The password confirm must be 8 characters or longer'],
			validate: {
				validator: function (value) {
					return value === this.password;
				},
				message:
					'The passord confirm must be equal to the selected password',
			},
		},
		userImage: {
			type: String,
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
