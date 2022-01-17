const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const appErr = require('../utils/appError');
const sendEmail = require('../utils/email');
const promisify = require('util').promisify;

//generar el token
const getToken = payload => {
	const tokenOptions = { expiresIn: process.env.JWT_EXPIRES };
	//SECRET debe ser al menos de 32 caractéres de longitud
	return jwt.sign(payload, process.env.SECRET, tokenOptions);
};

//esta función se llama cuando se han validado los datos.
//si llegas aquí es porque todo es correcto,
//se genera el token y se envía una respuesta con los datos del usuario
const logInUser = (user, statusCode, res) => {
	const token = getToken({ id: user._id });
	const { password, ...userInfo } = user._doc; //hago esto para quitar el password de la respuesta

	res.status(200).json({
		status: 'Success',
		token,
		data: { userInfo },
	});
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
		logInUser(doc, 201, res);
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
		if (!user) {
			return next(new appErr('ERROR: Usuario o password no válido'), 401);
		}
		const validPassword = await user.validatePassword(password, user.password);
		if (!validPassword) {
			return next(new appErr('ERROR: Usuario o password no válido'), 401);
		}

		logInUser(user, 200, res);
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
		//al usar el metodo post es como si estuviera creando un usuario nuevo,.. pero no es el caso. por eso no quiero que valide
		await user.save({ validateBeforeSave: false });
		//enviar email al usuario
		const resetUrl = `${req.protocol}://${req.get('host')}/${process.env.API_VERSION}/users/resetpass/${resetToken}`;
		const htmlMessage = `<p>Hemos recibido una petición para resetear tu password</p>
									<p>Para reestablecer tu password haz click en el siguiente enlace:</p>
									<p><a href = ${resetUrl}>${resetUrl}</a></p>
									<p>El enlace estará disponible durante los próximos 10 minutos</p>
									<p>Si no has realizado esta petición, por favor ignora este e-mail</p>`;
		const mail = {
			to: user.email,
			subject: 'Natours: Reestablecer la contraseña',
			text: '',
			htmlMessage,
		};

		const result = await sendEmail(mail);
		res.status(200).json({
			status: 'success',
			resetToken,
			message: 'Reset password email enviado correctamente.',
		});
	} catch (err) {
		user.passwordResetToken = undefined; //si no hemos conseguido enviar el e-mail para reestablecer el password, el token ya no es válido.
		user.passwordResetExpiration = undefined;
		await user.save({ validateBeforeSave: false });
		return next(new appErr('ERROR: Ocurrió un error al intentar enviar el e-mail para resetear su password.'), 500);
	}
};

const resetPassword = async (req, res, next) => {
	//encriptamos primero el token recibido para compararlo con el que tenemos almacenado en la bd
	const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
	console.log('req.params.token: ', req.params.token);
	try {
		//obtener usuario desde el token
		const query = { passwordResetToken: hashedToken, passwordResetExpiration: { $gt: Date.now() } };
		const user = await User.findOne(query);
		if (!user)
			return next(
				new appErr('ERROR: El usuario no existe, o el periodo para recuperar el password ha finalizado.'),
				404,
			);
		//si el token es válido actualizar el password
		user.password = req.body.password;
		user.passwordConfirm = req.body.passwordConfirm;
		user.passwordResetToken = undefined; //si no hemos conseguido enviar el e-mail para reestablecer el password, el token ya no es válido.
		user.passwordResetExpiration = undefined;
		await user.save();
		logInUser(user, 200, res); //logueo al usuario
	} catch (err) {
		next(err);
	}
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
		console.log(decoded);
		if (freshUser.changedPassword(decoded.iat))
			//en la propiedad 'iat' del token se guarda la fecha en segundos de nacimiento del token.
			//si desde que se creo el token hemos cambiado el password, el token ya no es válido
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

//actualizar el password sin el proceso de reseteo.
const updatePassword = async (req, res, next) => {
	//get user del objeto req (antes de acceder a esta función verificamos token y si es valido guardamos un valor en req con el usuario)
	const userId = req.user._id;
	try {
		const user = await User.findById(userId).select('+password'); //fuerzo seleccionar el password
		//comprobar el password introducido antes de cambiar nada
		if (!user || !(await user.validatePassword(req.body.oldPassword, user.password))) {
			return next(new appErr('ERROR: El password orignal no es válido'), 401);
		}
		console.log('updatepass');
		//cambiar el password
		user.password = req.body.password;
		user.passwordConfirm = req.body.passwordConfirm;
		const aux = await user.save();
		//obtener nuevo token y loguear al usuario
		logInUser(user, 200, res);
	} catch (err) {
		next(err);
	}
};
module.exports = { signup, login, verifyToken, restrictTo, forgotPassword, resetPassword, updatePassword };
