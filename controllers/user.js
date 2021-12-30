const User = require('../models/user');
const appErr = require('../utils/appError');

//handler users
const getAllUsers = async (req, res, next) => {
	try {
		const users = await User.find();
		res.status(200).json({
			status: 'Success',
			data: users,
		});
	} catch (error) {
		next(error);
	}
};

const createUser = (req, res, next) => {
	res.status(201).json({
		status: 'Success',
	});
};

const getUser = async (req, res, next) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) return next(new appErr('El usuario solicitado no existe en la BD.', 400));
		res.status(200).json({
			status: 'Success',
			user: user,
		});
	} catch (error) {
		next(error);
	}
};

const updateUser = (req, res, next) => {
	const userId = req.params.id;
	res.status(200).json({
		status: 'Success',
	});
};

const deleteUser = async (req, res, next) => {
	const userId = req.params.id;
	try {
		const user = await User.findByIdAndDelete(userId);
		if (!user) return next(new appErr('El usuario solicitado no existe en la BD'), 400);
		res.status(200).json({
			status: 'Success',
			result: `User ${user.name} deleted.`,
			user: user,
		});
	} catch (error) {
		next(error);
	}
};

module.exports = { getAllUsers, createUser, getUser, updateUser, deleteUser };
