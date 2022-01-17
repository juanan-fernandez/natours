const User = require('../models/user');
const appErr = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach(el => {
		if (allowedFields.includes(el)) newObj[el] = obj[el];
	});
	return newObj;
};

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

//esta función la usan los usuarios autenticados para actualizar sus datos
const updateMe = async (req, res, next) => {
	if (req.body.password || req.body.passwordConfirm) {
		return next(
			new appErr(
				'Esta ruta no es para actualizar el password. Por favor utiliza la opción Mi password para modificar el password',
				400,
			),
		);
	}
	const filteredBody = filterObj(req.body, 'name', 'email'); //por el momento solo dejamos actualizar al usuario el nombre y el email
	filteredBody['active'] = true;
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });
	res.status(200).json({ status: 'Success', data: updatedUser });
};

const deleteMe = async (req, res, next) => {
	try {
		const updatedUser = await User.findByIdAndUpdate(
			req.user.id,
			{ active: false },
			{ new: true, runValidators: true },
		);

		res.status(200).json({
			status: 'Success',
			data: `User account for ${updatedUser.name} has been disabled.`,
		});
	} catch (error) {
		next(error);
	}
};

const enableUser = async (req, res, next) => {
	try {
		const userId = '61cdf0c3254b7f50b0e5e30e';
		const criteria = { active: false, _id: userId };
		await User.updateOne(criteria, { active: true });

		res.status(200).json({
			status: 'Success',
			data: `User account ${userId} has been enabled.`,
		});
	} catch (error) {
		next(error);
	}
};

//función para que el admin actualize los datos de un usuario.
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

module.exports = { getAllUsers, createUser, getUser, updateMe, deleteMe, enableUser, updateUser, deleteUser };
