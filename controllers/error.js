const sendErrDev = (err, res) => {
	console.log('ERROR de Aplicación:');
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
		console.log('ERROR: ', err);
		res.status(500).json({ status: 'error', message: 'ERROR de aplicación' });
	}
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
		sendErrProduction(error, res);
	}
};
