const Tour = require('../models/tour');
const QueryBuilder = require('../utils/queryBuilder');
//Routes handlers

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

const aliasTopFive = (req, res, next) => {
	req.query.limit = 5;
	req.query.sort = 'price,-ratingsAverage';
	req.query.fields = 'name,price,ratingsAverage';
	next();
};

const getAllTours = async (req, res, next) => {
	const newQuery = new QueryBuilder(Tour.find(), req.query);
	//número de documentos que devolverá la query
	//const nDocs = await Tour.find(JSON.parse(queryStr)).countDocuments();

	// //ordenado de resultados
	// if (req.query.sort) {
	// 	const sortBy = req.query.sort.split(',').join(' ');
	// 	query = query.sort(sortBy);
	// } else {
	// 	query = query.sort('createdAt');
	// }

	// //campos a mostrar
	// if (req.query.fields) {
	// 	const fieldsSelected = req.query.fields.split(',').join(' ');
	// 	query = query.select(fieldsSelected);
	// } else {
	// 	query = query.select('-__v'); //excluir campos especiales de mongo
	// }

	// //paginacion: por defecto mostramos como mucho 100 registros
	// const limit = 1 * req.query.limit || 100;
	// let page = 1 * req.query.page || 1;

	// if (page * limit > nDocs) {
	// 	page = +(nDocs / limit).toFixed() + 1 * (nDocs % limit ? 1 : 0);
	// }
	// query = query.skip(limit * page - limit).limit(limit);

	const tours = await newQuery.query;
	res.status(200).json({
		status: 'Success',
		results: tours.length,
		data: { tours: tours },
	});
};

const createTour = async (req, res, next) => {
	const newTour = new Tour(req.body);
	try {
		//const newTour = await Tour.create(req.body) otra forma de hacerlo
		const doc = await newTour.save();
		res.status(201).json({
			status: 'Success',
			data: { tour: doc },
		});
	} catch (err) {
		console.log(err);
		next(err);
	}
};

const getTour = async (req, res, next) => {
	try {
		const tour = await Tour.findById(req.params.id);
		res.status(200).json({
			status: 'Success',
			requested: tour._id,
			data: { tour: tour },
		});
	} catch (err) {
		next(err);
	}
};

const updateTour = async (req, res, next) => {
	const tourId = req.params.id;
	try {
		const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});
		console.log(tour);
		res.status(200).json({
			status: 'Success',
			requested: tour._id,
			data: { tour: tour },
		});
	} catch (err) {
		next(err);
	}
};

const deleteTour = async (req, res, next) => {
	try {
		const deleted = await Tour.findByIdAndDelete(req.params.id);

		res.status(200).json({
			status: 'Success',
			data: { message: 'Deleted ' + deleted + ' 1 tour' },
		});
	} catch (err) {
		next(err);
	}
};

module.exports = {
	checkBodyTour,
	aliasTopFive,
	getAllTours,
	getTour,
	createTour,
	deleteTour,
	updateTour,
};
