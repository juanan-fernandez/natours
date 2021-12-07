const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
				//ESTA VALIDACIÓN SOLAMENTE FUNCIONA CON SAVE()
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

userSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 12);
		this.passwordConfirm = undefined; //no guardamos la confirmación del password
	}

	next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
