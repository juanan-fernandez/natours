class AppError extends Error {
	constructor(message, statusCode) {
		super(message);
		this.statusCode = statusCode || 500;
		this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error500';
		this.isOperational = true; //es un error que debemos reportar al cliente?

		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = AppError;
