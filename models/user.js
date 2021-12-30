const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
			validate: [validator.isEmail, 'The provided e-mail address is not valid.'],
		},
		password: {
			type: String,
			required: [true, 'The user must have a password.'],
			minLength: [8, 'The password must be 8 characters or longer'],
			select: false,
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
				message: 'The passord confirm must be equal to the selected password',
			},
		},
		passwordResetToken: String,
		passwordResetExpiration: Date,
		passwordChangedAt: Date,
		userImage: {
			type: String,
		},
		registerDate: Date,
		role: {
			type: String,
			enum: {
				values: ['user', 'guide', 'leader-guide', 'admin'],
				message: 'Avalaible values are: user, guide, leader-guide or admin',
			},
			default: 'user',
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
		this.passwordConfirm = undefined; //no guardamos la confirmación del password :fire
	}

	if (this.isNew) this.registerDate = Date.now();
	next();
});

userSchema.methods.getNow = function () {
	const currentDate = new Date();
	return (
		currentDate.getDate() +
		'/' +
		(currentDate.getMonth() + 1) +
		'/' +
		currentDate.getFullYear() +
		'T' +
		currentDate.getHours() +
		':' +
		currentDate.getMinutes() +
		':' +
		currentDate.getSeconds()
	);
};

userSchema.methods.validatePassword = async function (candidatePassword, userPassword) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPassword = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
		return JWTTimestamp < changedTimestamp;
	}

	return false; //si la propiedad no existe, devolvemos que el password no se ha cambiado
};

userSchema.methods.getPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex'); //genero un token aleatorio
	this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); //guardo el token generado encriptado en la bd
	this.passwordResetExpiration = Date.now() + 10 * 60 * 1000; //10 minutos de validez de este token
	return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
