const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();

const appError = require('./utils/appError');
const globalErrHander = require('./controllers/error');

//Middlewares
if (process.env.NODE_ENV === 'dev') app.use(morgan('dev'));
app.use(express.json()); //middleware para parsear el body que llega en cada req
app.use(express.static(path.join(__dirname, 'public'))); //definir la ruta dónde están los ficheros estáticos

//importar RUTAS
const tourRoutes = require('./routes/tours');
const userRoutes = require('./routes/users');

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);

//NOT FOUND ROUTE
app.all('*', (req, res, next) => {
	next(new appError(`Can not find ${req.originalUrl} on the server!`, 404));
});

//middleware para gestion de errores
app.use(globalErrHander);

module.exports = app;
