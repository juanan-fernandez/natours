const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();

app.use(express.json());

const fileName = path.join(__dirname, 'dev-data', 'data', 'tours-simple.json');

const tours = JSON.parse(fs.readFileSync(fileName));

app.get('/api/v1/tours', (req, res, next) => {
	res.status(200).json({
		status: 'Success',
		results: tours.length,
		data: { tours: tours },
	});
});

app.post('/api/v1/tours', (req, res, next) => {
	//console.log(req.body);
	const newId = tours[tours.length - 1].id + 1;
	const newTour = { id: newId, ...req.body };
	tours.push(newTour);
	fs.writeFile(fileName, JSON.stringify(tours), (err) => {
		if (err) {
			throw new Error('Error saving data!');
		}
		res.status(201).json({
			status: 'Success',
			data: { tour: newTour },
		});
	});
});

app.get('/api/v1/tours/:id', (req, res, next) => {
	const tourId = req.params.id * 1;
	const tour = tours.find((t) => t.id === tourId);
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
});

const port = 3000;
app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
