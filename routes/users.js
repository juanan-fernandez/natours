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

//para accder a cualquier ruta desde aquí el usuario debe estar logueado. (video 164)
//Por eso coloco el middleware verifyToken encima de todo para que sólo pase a la siguiente ruta si el token es correcto.
router.use(authCtl.verifyToken);
router.route('/updatepass').patch(authCtl.updatePassword);

//otra forma para expresar las rutas sería la siguiente
router.get('/getMe', usersCtl.getMeId, usersCtl.getMe);
router.patch('/updateMe', usersCtl.updateMe);
router.delete('/deleteMe', usersCtl.deleteMe);

//RUTAS user
router.use(authCtl.restrictTo('admin')); //sólo el administrador puede usar estas rutas.
router.route('/').get(usersCtl.getAllUsers);
//.post(usersCtl.createUser); es /signup
router.patch('/enableUser/:id', usersCtl.enableUser);
//RUTAS user id
router.route('/:id').get(usersCtl.getUser).patch(usersCtl.updateUser).delete(usersCtl.deleteUser);

module.exports = router;
