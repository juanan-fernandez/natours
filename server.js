/* eslint-disable no-console */
//env variables
require('dotenv').config();
const app = require('./app');
const mongol = require('mongoose');

const DB = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWD}@cluster-jonas-node-cour.7btv5.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;

mongol
	.connect(DB, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	})
	.then((con) => {
		//Server
		const port = process.env.PORT || 3000;
		app.listen(port, () => {
			console.log(`Server listening on port ${port}`);
		});
	})
	.catch((err) => {
		console.log(`Imposible conectar con la BD. ERROR: ${err}`);
	});
