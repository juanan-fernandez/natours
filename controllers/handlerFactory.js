const QueryBuilder = require('../utils/queryBuilder');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

//las dos siguientes funciones hacen lo mismo deleteOne es la del profesor
const deleteOne = Model =>
	catchAsync(async (req, res, next) => {
		const deleted = await Model.findByIdAndDelete(req.params.id);
		if (!deleted) {
			return next(new appError(`No document found with that id: ${req.params.id}.`, 404));
		}
		res.status(204).json({
			status: 'Success',
			data: { message: 'Deleted document with id ' + req.params.id },
		});
	});

//también podemos hacer esto SIN USAR catchAsync
const deleteOneById = Model => async (req, res, next) => {
	try {
		const deleted = await Model.findByIdAndDelete(req.params.id);
		if (!deleted) {
			return next(new appError(`No document found with that id: ${req.params.id}`, 404));
		}
		res.status(200).json({
			status: 'Success',
			data: { message: 'Deleted document with id ' + req.params.id },
		});
	} catch (err) {
		next(err);
	}
};

const createOne = Model => async (req, res, next) => {
	const newDoc = new Model(req.body);
	try {
		//const newTour = await Tour.create(req.body) otra forma de hacerlo
		const doc = await newDoc.save();
		res.status(201).json({
			status: 'Success',
			data: { doc },
		});
	} catch (err) {
		next(err);
	}
};

const updateOneById = Model => async (req, res, next) => {
	try {
		const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!doc) {
			return next(new appError(`No document found with that id: ${req.params.id}`, 404));
		}

		res.status(200).json({
			status: 'Success',
			requested: doc._id,
			data: { doc },
		});
	} catch (err) {
		next(err);
	}
};

const getAll = Model => async (req, res, next) => {
	if (req.params.tourId) req.query.tourReview = req.params.tourId; //hack para buscar las reviews que pertenecen a un tour

	try {
		const queryAll = new QueryBuilder(Model.find(), req.query).filter().sort().select().paginate();
		const docs = await queryAll.query;
		//const docs = await queryAll.query.explain();

		res.status(200).json({
			status: 'Success',
			results: docs.length,
			data: { docs },
		});
	} catch (err) {
		next(err);
	}
};

const getOneById = (Model, populateOptions) => async (req, res, next) => {
	try {
		let query = Model.findById(req.params.id);
		if (populateOptions) query = query.populate(populateOptions);
		const doc = await query;

		if (!doc) {
			return next(new appError(`No document found with that id: ${req.params.id}`, 404));
		}

		res.status(200).json({
			status: 'Success',
			requested: doc._id,
			data: { doc },
		});
	} catch {
		next(err);
	}
};

module.exports = { deleteOneById, deleteOne, updateOneById, createOne, getAll, getOneById };
