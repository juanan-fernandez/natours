const allUsers = require('../dev-data/data/users.json');

//handler users
const getAllUsers = (req, res, next) => {
	res.status(200).json({
		status: 'Success',
	});
};

const createUser = (req, res, next) => {
	res.status(201).json({
		status: 'Success',
	});
};

const getUser = (req, res, next) => {
	const userId = req.params.id;
	res.status(200).json({
		status: 'Success',
	});
};

const updateUser = (req, res, next) => {
	const userId = req.params.id;
	res.status(200).json({
		status: 'Success',
	});
};

const deleteUser = (req, res, next) => {
	const userId = req.params.id;
	res.status(200).json({
		status: 'Success',
	});
};

module.exports = { getAllUsers, createUser, getUser, updateUser, deleteUser };
