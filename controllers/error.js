const appError = require('../utils/appError');

const handleCastError = (err) => {
	return new appError(`The requested id: ${err.value} is invalid`, 400);
};

const handleDbError = (err) => {
	if (err.code === 11000) {
		//const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

		msg = `Duplicate field ${JSON.stringify(
			err.keyValue,
		)}. You're trying to save a duplicated key!`;

		return new appError(msg, 400);
	}
};

const handleJWTError = (_) =>
	new appError('ERROR: Sesión de usuario incorrecta', 401);

const handleExpiredToken = (_) =>
	new appError('ERROR: Su sesión de usuario ha caducado', 401);

const handleValidation = (err) => {
	return new appError('No valid data: ' + err.message, 400);
};

const sendErrDev = (err, res) => {
	console.log('ERROR de Aplicación:', err.message);
	res.status(err.statusCode).json({
		error: err,
		status: err.status,
		message: err.message,
		stack: err.stack,
	});
};

const sendErrProduction = (err, res) => {
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message, //mensje para el usuario
		});
	} else {
		//se refiere a errores de código o errores no controlados
		//log del error o enviar un e-mail al administrador, etc..
		console.error('ERROR: ', err);
		res.status(500).json({
			status: 'error',
			message: 'ERROR (500) de aplicación!!!',
			error: err,
		});
	}
};

const errTypes = {
	CastError: (err) => handleCastError(err),
	MongoError: (err) => handleDbError(err),
	ValidationError: (err) => handleValidation(err),
	JsonWebTokenError: (err) => handleJWTError(),
	TokenExpiredError: (err) => handleExpiredToken(),
};

module.exports = (error, req, res, next) => {
	//podriamos hacer log del error en un fichero de texto,
	//redirigir a una página para mostrar más información del error,
	//enviar un e-mail al administrador, etc...
	error.status = error.status || 'error';
	error.statusCode = error.statusCode || 500;
	if (process.env.NODE_ENV === 'dev') {
		sendErrDev(error, res);
	} else if (process.env.NODE_ENV === 'prod') {
		let objErr = { ...error };
		//en produccion los mensajes de error al usuario deben ser sencillos sin terminología técnica
		//console.log(error);

		if (error.name && errTypes[error.name]) {
			objErr = errTypes[error.name](error);
		}
		sendErrProduction(objErr, res);
	}
};
