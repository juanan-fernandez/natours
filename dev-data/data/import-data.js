//const fs = require('fs');
const mongo = require('mongoose');
const Tour = require('../../models/tour');
const jsonData = require('./tours-simple.json');

require('dotenv').config();

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWD}@cluster-jonas-node-cour.7btv5.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;

//const json = JSON.parse(fs.readFileSync('./tours-simple.json'));

mongo
	.connect(uri, {
		useCreateIndex: true,
		useUnifiedTopology: true,
		useNewUrlParser: true,
	})
	.then((_) => {
		return Tour.deleteMany({})
			.then(() => {
				Tour.insertMany(jsonData, (err, result) => {
					if (err) {
						console.log(err);
					} else {
						console.log('Datos importados correctamente.');
					}
					process.exit();
				});
			})
			.catch((err) => {
				console.log(err);
			});
	});
