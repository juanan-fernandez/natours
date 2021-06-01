const fs = require('fs');
const path = require('path');

const fileName = path.join(__dirname, '..', 'dev-data', 'data', 'tours-simple.json');
const tours = JSON.parse(fs.readFileSync(fileName));

//Routes handlers

const checkId = (req, res, next, val) => {
	const tourId = req.params.id * 1;
	const tour = tours.find(t => t.id === tourId);
	if (!tour) {
		return res.status(404).json({
			status: 'Not found',
			message: 'checkId: Any tour found with id: ' + tourId,
		});
	}
	next(); //si hemos encontrado un tour con el id pasado como parametro continuamos
};

const checkBodyTour = (req, res, next) => {
	const arrayErrs = [];
	if (!req.body.name.trim()) {
		arrayErrs.push('El nombre del tour no puede ser una cadena vacia.');
	}

	if (!req.body.price || 1 * req.body.price <= 0) {
		arrayErrs.push('El precio del tour debe ser un valor mayor que 0.');
	}

	if (arrayErrs.length > 0) {
		return res.status(422).json({
			status: 'Invalid data',
			message: 'checkNewTourData: Invalid data entered.',
			errores: arrayErrs,
		});
	}
	next();
};

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
	//no compruebo que he hallado el tour con ese id porque lo hago con el middleware checkId arriba del todo
	res.status(200).json({
		status: 'Success',
		requested: tourId,
		data: { tour: tour },
	});
};

const updateTour = (req, res, next) => {
	const tourId = req.params.id * 1;
	const tour = tours.find(t => t.id === tourId);
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
	}

	if (!deletedCount) {
		return res.status(404).json({
			status: 'Not found',
			message: 'Unable to delete. Any tour found with id: ' + tourId,
		});
	}
	res.status(200).json({
		status: 'Success',
		data: { message: 'Deleted ' + deletedCount + ' tour/s' },
	});
};

module.exports = { checkBodyTour, checkId, getAllTours, getTour, createTour, deleteTour, updateTour };
