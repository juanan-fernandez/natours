const User = require('../models/user');
const appErr = require('../utils/appError');
const { deleteOneById, updateOneById, getOneById, getAll } = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach(el => {
		if (allowedFields.includes(el)) newObj[el] = obj[el];
	});
	return newObj;
};

//OPERACIONES CRUD con las funciones refactorizadas
//función para que el admin actualize los datos de un usuario.
const updateUser = updateOneById(User);
//borrar usuario por el admin.
const deleteUser = deleteOneById(User);
const getAllUsers = getAll(User);
const getUser = getOneById(User);

//middleware para indicar en req.params el id del usuario actual
const getMeId = (req, res, next) => {
	req.params.id = req.user.id;
	next();
};
const getMe = getOneById(User);

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

module.exports = { getAllUsers, getUser, getMeId, getMe, updateMe, deleteMe, enableUser, updateUser, deleteUser };

//handler users
// const getAllUsers = async (req, res, next) => {
// 	try {
// 		const users = await User.find();
// 		res.status(200).json({
// 			status: 'Success',
// 			data: users,
// 		});
// 	} catch (error) {
// 		next(error);
// 	}
// };

// const deleteUser = async (req, res, next) => {
// 	try {
// 		const user = await User.findByIdAndDelete(req.params.id);
// 		if (!user) return next(new appErr('El usuario solicitado no existe en la BD'), 400);

// 		user.password = undefined; //quitar password de la respuesta
// 		res.status(200).json({
// 			status: 'Success',
// 			result: `User ${user.name} deleted.`,
// 			user: user,
// 		});
// 	} catch (error) {
// 		next(error);
// 	}
// };

// const getUser = async (req, res, next) => {
// 	try {
// 		const user = await User.findById(req.params.id);
// 		if (!user) return next(new appErr('El usuario solicitado no existe en la BD.', 400));
// 		res.status(200).json({
// 			status: 'Success',
// 			user: user,
// 		});
// 	} catch (error) {
// 		next(error);
// 	}
// };
