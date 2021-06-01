const express = require('express');
const router = express.Router();

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

//RUTAS user
router.route('/api/v1/users').get(getAllUsers).post(createUser);
router.route('/api/v1/users/:id').get(getUser).patch(updateUser).delete(deleteUser);
module.exports = router;
