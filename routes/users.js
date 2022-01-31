const express = require('express');
const router = express.Router();
const usersCtl = require('../controllers/user');
const authCtl = require('../controllers/auth');

//router.get('/mytest', usersCtl.mytest);

//Rutas auth
router.route('/signup').post(authCtl.signup);
router.route('/login').post(authCtl.login);
router.route('/forgotpass').post(authCtl.forgotPassword);
router.route('/resetpass/:token').patch(authCtl.resetPassword);
router.route('/updatepass').patch(authCtl.verifyToken, authCtl.updatePassword);
//otra forma para las rutas sería la siguiente
router.get('/getMe', authCtl.verifyToken, usersCtl.getMeId, usersCtl.getMe);
router.patch('/updateMe', authCtl.verifyToken, usersCtl.updateMe);
router.delete('/deleteMe', authCtl.verifyToken, usersCtl.deleteMe);
router.patch('/enableUser', usersCtl.enableUser);

//RUTAS user
router.route('/').get(usersCtl.getAllUsers);
//.post(usersCtl.createUser); es /signup
//RUTAS user id
router.route('/:id').get(usersCtl.getUser).patch(usersCtl.updateUser).delete(usersCtl.deleteUser);

module.exports = router;
