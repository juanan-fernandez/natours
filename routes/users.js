const express = require('express');
const router = express.Router();
const usersCtl = require('../controllers/user');
const authCtl = require('../controllers/auth');

//RUTAS user
router.route('/').get(usersCtl.getAllUsers).post(usersCtl.createUser);
router.route('/:id').get(usersCtl.getUser).patch(usersCtl.updateUser).delete(usersCtl.deleteUser);

//Rutas auth
router.route('/signup').post(authCtl.signup);
router.route('/login').post(authCtl.login);
router.route('/forgotpass').post(authCtl.forgotPassword);
router.route('/resetpass').post(authCtl.resetPassword);

module.exports = router;
