module.exports = (error, req, res, next) => {
	//podriamos hacer log del error en un fichero de texto,
	//redirigir a una página para mostrar más información del error,
	//enviar un e-mail al administrador, etc...
	console.log('ERROR de Aplicación: ', error);
	error.status = error.status || 'error';
	error.statusCode = error.statusCode || 500;
	res.status(error.statusCode).json({
		status: error.status,
		message: error.message, //mensje para el usuario
	});
};
