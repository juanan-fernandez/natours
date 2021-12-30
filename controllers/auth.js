const jwt = require('jsonwebtoken');
const User = require('../models/user');
const appErr = require('../utils/appError');
const promisify = require('util').promisify;

//generar el token
const getToken = payload => {
	const tokenOptions = { expiresIn: process.env.JWT_EXPIRES };
	return jwt.sign(payload, process.env.SECRET, tokenOptions);
};

//registrar usuario
const signup = async (req, res, next) => {
	const user = {
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
		role: req.body.role,
	};

	const newUser = new User(user);
	try {
		const doc = await newUser.save();
		//SECRET debe ser al menos de 32 caractéres de longitud
		const token = jwt.sign({ id: doc._id }, process.env.SECRET, {
			expiresIn: process.env.JWT_EXPIRES,
		});
		res.status(200).json({
			status: 'success',
			token,
			data: { user: doc },
		});
	} catch (err) {
		next(err);
	}
};

//validar usuario (login)
const login = async (req, res, next) => {
	const { email, password } = req.body;

	//1. check inputs
	if (!email || !password) return next(new appErr('Por favor, debe indicar un usuario y un passord', 400));

	try {
		//check if user e-mail and password are valid
		const user = await User.findOne({ email: email }).select('+password');
		// if (!user)
		// 	return next(new appErr('ERROR: Usuario o password no válido'), 400);
		// //compare provided password with the stored password
		// const ok = user.validatePassword(password, user.password);
		// if (!ok)
		// 	return next(new appErr('ERROR: Usuario o password no válido'), 400);

		//otra opción más elegante
		if (!user || !user.validatePassword(password, user.password))
			return next(new appErr('ERROR: Usuario o password no válido'), 401);

		token = getToken({ id: user._id });
		res.status(200).json({
			status: 'success',
			token,
			data: { email: user.email, name: user.name },
		});
	} catch (err) {
		next(err);
	}
};

//restaruar password
const forgotPassword = async (req, res, next) => {
	try {
		//comprobar si el email pasado existe en la bd
		const user = await User.findOne({ email: req.body.email });
		if (!user) return next(new appErr('ERROR: El email indicado no existe en la base de datos.'), 404);
		//generar el token reset
		const resetToken = user.getPasswordResetToken();
		await user.save({ validateBeforeSave: false });
		//enviar email al usuario
	} catch (err) {
		next(err);
	}
};

const resetPassword = async (req, res, next) => {
	//obtener usuario
	//verificar token de reset
	//actualizar password
};

const verifyToken = async (req, res, next) => {
	try {
		let token = '';
		//get token
		if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
			token = req.headers.authorization.split(' ')[1];
		}
		if (!token) return next(new appErr('ERROR: Sesión de usuario incorrecta'), 401);

		//validar token: si el token es correcto, en decoded se me devuelve el payload del token
		const decoded = await promisify(jwt.verify)(token, process.env.SECRET);

		//verificar si el usuario existe
		const freshUser = await User.findById(decoded.id);
		if (!freshUser) return next(new appErr('ERROR: El usuario asociado al token no existe en la BD', 401));
		//comprobar si el usuario cambio el password después de que el token se creo o reinició? VIDEO 131
		//console.log(decoded);
		if (freshUser.changedPassword(decoded.iat))
			//en la propiedad 'iat' del token se guarda la fecha en segundos de nacimiento del token.
			return next(new appErr('ERROR: El usuario modificó su password. Por favor inicie sesión de nuevo', 401));

		//si llega hasta aquí el código puede continuar con el siguiente middleware
		req.user = freshUser; //pasamos el usuario al siguiente middleware
		next();
	} catch (err) {
		next(err);
	}
};

const restrictTo = (...roles) => {
	return async (req, res, next) => {
		if (!roles.includes(req.user.role))
			return next(new appErr('ERROR: No tiene permisos para realizar esta acción.', 404));
		next();
	};
};

module.exports = { signup, login, verifyToken, restrictTo, forgotPassword, resetPassword };
