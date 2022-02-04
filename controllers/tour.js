const Tour = require('../models/tour');
const AppError = require('../utils/appError');
const QueryBuilder = require('../utils/queryBuilder');
//const appError = require('../utils/appError');
const { createOne, getOneById, deleteOneById, updateOneById, getAll } = require('./handlerFactory');

//OPERACIONES CRUD con las funciones refactorizadas.
const getAllTours = getAll(Tour);
const createTour = createOne(Tour);
const getTour = getOneById(Tour, { path: 'reviews' });
const updateTour = updateOneById(Tour);
const deleteTour = deleteOneById(Tour);

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
	req.query.sort = '-ratingsAverage, price';
	req.query.fields = 'name,price,ratingsAverage';
	next();
};

//PRUEBAS
//me creo esto para pruebas
const getTheTours = async (req, res, next) => {
	const newQuery = new QueryBuilder(Tour.find(), req.query);

	//const q2 = countQuery.filter().countDocs().query;
	const tours = await newQuery.filter().sort().select().paginate().query;
	const ndocs = await newQuery.countDocs().query;
	const tours2 = await newQuery.filter().query;

	res.status(200).json({
		status: 'Success',
		results: tours.length,
		nDocs: ndocs,
		data: { tours: [] },
		data2: { tours2: tours2 },
	});
};

const getNumberOfDocs = async (req, res, next) => {
	//req.query.price = 1450;
	const q = Tour.find();
	//q.model = Tour;
	q.countDocuments(req.query, (err, res) => {
		if (err) {
			console.log(err);
		} else {
			console.log(res);
		}
	});
};
///////////FIN PRUEBAS///////////////////////////////////////////

// const getAllTours = async (req, res, next) => {
// 	const newQuery = new QueryBuilder(Tour.find(), req.query);

// 	const tours = await newQuery.filter().sort().select().paginate().query;

// 	res.status(200).json({
// 		status: 'Success',
// 		results: tours.length,
// 		data: { tours: tours },
// 	});
// };

const getTourStats = async (req, res, next) => {
	try {
		const stats = Tour.aggregate([
			{ $match: { ratingsAverage: { $gte: 4.5 } } },
			{
				$group: {
					_id: { $toUpper: '$difficulty' },
					totalTours: { $sum: 1 },
					numOfRatings: { $sum: '$ratingsQuantity' },
					avgRating: { $avg: '$ratingsAverage' },
					avgPrice: { $avg: '$price' },
					minPrice: { $min: '$price' },
					maxPrice: { $max: '$price' },
				},
			},
			{
				$sort: { avgPrice: 1 },
			},
		]);

		const results = await stats;
		res.status(200).json({
			status: 'Success',
			data: results,
		});
	} catch (err) {
		next(err);
	}
};

const getMonthPlan = async (req, res, next) => {
	try {
		const year = +req.params.year;

		const plan = Tour.aggregate([
			{ $unwind: '$startDates' },
			{
				$match: {
					startDates: {
						$gte: new Date(`${year}-01-01`),
						$lte: new Date(`${year}-12-31`),
					},
				},
			},
			{ $project: { startDates: 1, name: 1 } },
			{
				$group: {
					_id: { $month: '$startDates' },
					totalTours: { $sum: 1 },
					tours: { $push: '$name' },
				},
			},
			{ $addFields: { month: '$_id' } },
			{ $project: { _id: 0 } },
			{ $sort: { month: 1 } },
		]);
		const results = await plan;
		res.status(201).json({
			status: 'Success',
			data: results,
		});
	} catch (err) {
		next(err);
	}
};

const getGeoSpatial = async (req, res, next) => {
	const { distance, latlng, unit } = req.params;
	const [lat, lng] = latlng.split(',');
	//si la unidad de medida son millas los radianes se calculan dividiendo entre el radio de la tierra en millas
	//si son kms entre el radio de la tierra en kms.
	const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
	if (!lat || !lng) {
		next(new AppError('Por favor indique unas coordenadas válidas', 400));
	}
	try {
		const tours = await Tour.find({
			startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
		}).select('name');
		res.status(201).json({
			status: 'Success',
			results: tours.length,
			data: tours,
		});
		// const geo = Tour.aggregate([
		// 	{
		// 		$geoNear: {
		// 			near: {
		// 				type: 'Point',
		// 				coordinates: [lng, lat],
		// 			},
		// 		},
		// 		distanceField: 'dist.calculated',
		// 		spherical: true,
		// 		maxDistance: 10000,
		// 	},
		// ]);
		// const results = await geo;
	} catch (err) {
		next(new AppError(err.message, 500));
	}
};

module.exports = {
	getNumberOfDocs,
	getTheTours,
	checkBodyTour,
	aliasTopFive,
	getAllTours,
	getGeoSpatial,
	getTourStats,
	getMonthPlan,
	getTour,
	createTour,
	updateTour,
	deleteTour,
};

//FORMA TRADICIONAL
// const getTour = async (req, res, next) => {
// 	try {
// 		const tour = await Tour.findById(req.params.id).populate('reviews'); //virtual populate
// 		//const tour = await Tour.findById(req.params.id).populate({ path: 'guides', select: 'name email -_id' }); //populate seleccionando campos
// 		if (!tour) {
// 			return next(new appError(`No tour found with the id ${req.params.id}`, 404));
// 		}
// 		res.status(200).json({
// 			status: 'Success',
// 			requested: tour._id,
// 			data: { tour: tour },
// 		});
// 	} catch (err) {
// 		next(err);
// 	}
// };

//FORMA TRADICIONAL
// const deleteTour = async (req, res, next) => {
// 	try {
// 		const deleted = await Tour.findByIdAndDelete(req.params.id);
// 		if (!deleted) {
// 			return next(new appError(`No tour found with that id: ${req.params.id}.`, 404));
// 		}
// 		res.status(200).json({
// 			status: 'Success',
// 			data: { message: 'Deleted tour with id ' + req.params.id },
// 		});
// 	} catch (err) {
// 		next(err);
// 	}
// };
