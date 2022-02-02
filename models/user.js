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
		active: {
			type: Boolean,
			default: true,
			select: false,
		},
		passwordResetToken: String,
		passwordResetExpiration: Date,
		passwordChangedAt: String,
		userImage: {
			type: String,
		},
		registerDate: String,
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

//query middleware expresión regular con find para que lo aplique a cualquier sentencia que comienze por 'find'
userSchema.pre(/^find/, function (next) {
	//this apunta al objeto query actual
	//this.find({ active: true });
	this.find({ active: { $ne: false } }); //esta forma es más correcta por si no existe el campo en alguno de los documentos
	next();
});

userSchema.pre('save', function (next) {
	if (this.isModified('password') && !this.isNew) {
		const newDate = this.getNow(10000);
		//le resto 10 segundos por si el token con su fecha de expiración se crea antes de que se guarde el valor passwordchangedAt
		this.passwordChangedAt = this.getNow(10000);
	}
	next();
});

//la siguiente función solo actua usando modelo.save() o modelo.create()
userSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 12);
		this.passwordConfirm = undefined; //no guardamos la confirmación del password
	}
	next();
});

userSchema.pre('save', function (next) {
	if (this.isNew) this.registerDate = this.getNow();
	next();
});

userSchema.methods.getNow = function (offset = 0) {
	const date = new Date(Date.now() - offset);
	return (
		date.getFullYear() +
		'-' +
		('0' + (date.getMonth() * 1 + 1)).slice(-2) +
		'-' +
		('0' + date.getDate()).slice(-2) +
		'T' +
		('0' + date.getHours()).slice(-2) +
		':' +
		('0' + date.getMinutes()).slice(-2) +
		':' +
		('0' + date.getSeconds()).slice(-2)
	);
};

userSchema.methods.validatePassword = async function (candidatePassword, userPassword) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPassword = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedDate = new Date(this.passwordChangedAt);
		const changedTimestamp = parseInt(changedDate.getTime() / 1000, 10);
		console.log('token ' + JWTTimestamp);
		console.log('changed ' + changedDate, changedTimestamp);
		return JWTTimestamp < changedTimestamp; //true: la modificación del password es posterior a la creación del token
	}

	return false; //si la propiedad no existe, devolvemos que el password no se ha cambiado
};

userSchema.methods.getPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex'); //genero un token aleatorio
	this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); //guardo el token generado encriptado en la bd
	this.passwordResetExpiration = Date.now() + 120 * 60 * 1000; //10 minutos de validez de este token
	return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
