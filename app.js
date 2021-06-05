const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();

//Middlewares
if (process.env.NODE_ENV === 'dev') app.use(morgan('dev'));
app.use(express.json()); //middleware para parsear el body que llega en cada req
app.use(express.static(path.join(__dirname, 'public'))); //definir la ruta dónde están los ficheros estáticos
//middleware para gestion de errores
app.use((error, req, res, next) => {
	//podriamos hacer log del error en un fichero de texto,
	//redirigir a una página para mostrar más información del error,
	//enviar un e-mail al administrador, etc...
	console.log('ERROR de Aplicación: ', error);
	const status = error.statusCode || 500;
	const message = error.message;
	res.status(status).json({ message: message }); //mensje para el usuario
});
//importar RUTAS
const tourRoutes = require('./routes/tours');
const userRoutes = require('./routes/users');

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);

module.exports = app;
