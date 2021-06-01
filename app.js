const express = require('express');
const morgan = require('morgan');

const app = express();

//Middlewares
app.use(morgan('dev'));
app.use(express.json()); //middleware para parsear el body que llega en cada req

//importar RUTAS
const tourRoutes = require('./routes/tours');
const userRoutes = require('./routes/users');

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);

module.exports = app;
