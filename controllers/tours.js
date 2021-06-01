const fs = require('fs');
const path = require('path');

const fileName = path.join(__dirname, '..', 'dev-data', 'data', 'tours-simple.json');
const tours = JSON.parse(fs.readFileSync(fileName));

//Routes handlers
const getAllTours = (req, res, next) => {
	res.status(200).json({
		status: 'Success',
		results: tours.length,
		data: { tours: tours },
	});
};

const createTour = (req, res, next) => {
	//console.log(req.body);
	const newId = tours[tours.length - 1].id + 1;
	const newTour = { id: newId, ...req.body };
	tours.push(newTour);
	fs.writeFile(fileName, JSON.stringify(tours), err => {
		if (err) {
			throw new Error('Error saving data!');
		}
		res.status(201).json({
			status: 'Success',
			data: { tour: newTour },
		});
	});
};

const getTour = (req, res, next) => {
	const tourId = req.params.id * 1;
	const tour = tours.find(t => t.id === tourId);
	if (!tour) {
		return res.status(404).json({
			status: 'Not found',
			message: 'Any tour found with id: ' + tourId,
		});
	}
	res.status(200).json({
		status: 'Success',
		requested: tourId,
		data: { tour: tour },
	});
};

const updateTour = (req, res, next) => {
	const tourId = req.params.id * 1;
	const tour = tours.find(t => t.id === tourId);
	if (!tour) {
		return res.status(404).json({
			status: 'Not found',
			message: 'Any tour found with id: ' + tourId,
		});
	}
	res.status(200).json({
		status: 'Success',
		data: { tour: 'Updated tour' },
	});
};

const deleteTour = (req, res, next) => {
	let deletedCount = 0;
	const tourId = req.params.id * 1;
	let idx = tours.findIndex(t => t.id === tourId);
	while (idx != -1) {
		deletedCount++;
		tours.splice(idx, 1);
		idx = tours.findIndex(t => t.id === tourId);
		console.log(idx);
	}

	if (!deletedCount) {
		return res.status(404).json({
			status: 'Not found',
			message: 'Unable to delete. Any tour found with id: ' + tourId,
		});
	}
	console.log(tours);
	res.status(200).json({
		status: 'Success',
		data: { message: 'Deleted ' + deletedCount + ' tour/s' },
	});
};

module.exports = { getAllTours, getTour, createTour, deleteTour, updateTour };
