/* eslint-disable no-console */
//env variables
require('dotenv').config();
const app = require('./app');
const mongol = require('mongoose');

const DB = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWD}@cluster-jonas-node-cour.7btv5.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;

//video 122. este código debe ir al principio para los errores síncronos no controlados.
process.on('uncaughtException', (err) => {
	console.log(err.name, err.message);
	process.exit(1);
});

mongol
	.connect(DB, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	})
	.then((con) => {
		console.log('DB connection successful!');
	})
	.catch((err) => {
		console.log(`Imposible conectar con la BD. ERROR: ${err}`);
	});

//Server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});

//video 121
process.on('unhandledRejection', (err) => {
	console.log(err.name, err.message);
	server.close(() => {
		process.exit(1);
	});
});
