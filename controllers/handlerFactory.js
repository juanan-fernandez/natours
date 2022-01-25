const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const deleteFromModel = Model =>
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
const deleteOne = Model => async (req, res, next) => {
	try {
		const deleted = await Model.findByIdAndDelete(req.params.id);
		if (!deleted) {
			return next(new appError(`No document found with that id: ${req.params.id}.`, 404));
		}
		res.status(204).json({
			status: 'Success',
			data: { message: 'Deleted document with id ' + req.params.id },
		});
	} catch (err) {
		next(err);
	}
};

module.exports = { deleteFromModel, deleteOne };
