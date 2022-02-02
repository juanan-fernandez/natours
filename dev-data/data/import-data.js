//const fs = require('fs');
const mongo = require('mongoose');
const Tour = require('../../models/tour');
const User = require('../../models/user');
const Review = require('../../models/reviews');

const jsonData = require('./tours.json');
const reviewData = require('./reviews.json');
const userData = require('./users.json');

require('dotenv').config();

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWD}@cluster-jonas-node-cour.7btv5.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;

//const json = JSON.parse(fs.readFileSync('./tours-simple.json'));

function connectMongo() {
	return mongo.connect(uri, {
		useCreateIndex: true,
		useUnifiedTopology: true,
		useNewUrlParser: true,
	});
}

const readAllData = async () => {
	const connection = await connectMongo();
	await Tour.deleteMany();
	await Tour.insertMany(jsonData);
	await User.deleteMany();
	await User.create(userData, { validateBeforeSave: false });
	await Review.deleteMany();
	await Review.create(reviewData, { validateBeforeSave: false });
	console.log('fin importacion');
	process.exit();
};

const readTourData = async () => {
	const conex = await connectMongo();
	await connectMongo();
	await Tour.deleteMany();
	await Tour.insertMany(jsonData);
};

closeNodeProcess = () => {
	process.exit();
};

readTourData();
closeNodeProcess();

//readAllData();
