const express = require('express');
const morgan = require('morgan');
const path = require('path');
//paquetes de seguridad
const rateLimit = require('express-rate-limit'); //limitador de peticiones para evitar ataques DDOS
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
//desarrollos
const appError = require('./utils/appError');
const globalErrHandler = require('./controllers/error');

const app = express();

//GLOBAL Middlewares
app.use(helmet()); //Securizar HTTP Headers https://helmetjs.github.io/

if (process.env.NODE_ENV === 'dev') {
	app.use(morgan('dev'));
}

//rate limiter es para prevenir ataques DDOS
//https://www.npmjs.com/package/express-rate-limit
//con la siguiente limitación, el servidor sólo aceptará 100 peticiones cada 15 minutos
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Apply the rate limiting middleware to all requests
//app.use(limiter);
//así el limitador lo pongo unicamente a las peticiones $host/api/...
app.use('/api', limiter);

//middleware para parsear el body que llega en cada req (limito el tamaño de la info a 10kb)
app.use(express.json({ limit: '10kb' }));

//DESUPUES DE PARSEAR EL BODY: MUY IMPORTANTE!!!! usamos varios paquetes de seguridad.
//Filtrado de datos para prevenir inyección SQL (video 144)
app.use(mongoSanitize());
//Filtrado de código html o javascript malicioso
app.use(xss());
//eliminar paso de parámetros duplicados (parameter pollution)
//en la lista blanca se coloca un array de parámetros qeue sí pueden estar duplicados
app.use(hpp({ whitelist: ['duration', 'ratingsAverage', 'price'] }));

//definir la ruta dónde están los ficheros estáticos
app.use(express.static(path.join(__dirname, 'public')));

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
app.use(globalErrHandler);

module.exports = app;
