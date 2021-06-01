const express = require('express');
const router = express.Router();
const usersCtl = require('../controllers/user');

//RUTAS user
router.route('/').get(usersCtl.getAllUsers).post(usersCtl.createUser);
router.route('/:id').get(usersCtl.getUser).patch(usersCtl.updateUser).delete(usersCtl.deleteUser);
module.exports = router;
