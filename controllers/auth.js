const User = require('../models/user');

//registrar usuario
const signup = async (req, res, next) => {
	const newUser = new User(req.body);
	try {
		const doc = await newUser.save();
		res.status(200).json({
			status: 'success',
			data: { user: doc },
		});
	} catch (err) {
		next(err);
	}
};

//validar usuario (login)

module.exports = { signup };
