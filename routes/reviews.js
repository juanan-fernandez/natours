const express = require('express');
const reviewCtl = require('../controllers/review.js');
const authCtl = require('../controllers/auth');
const router = express.Router({ mergeParams: true }); //video 158. con esta opción recoge los parámetros que pasan en el prefijo.

//solamente pueden crear reviews los usuarios autenticados y con rol 'user'
//router.post('/', authCtl.verifyToken, authCtl.restrictTo('user'), reviewCtl.postReview);

//solamente usuarios logueados pueden ver las reviews
router.use(authCtl.verifyToken);

router
	.route('/')
	.get(reviewCtl.filterReviewByTour, reviewCtl.getReviews)
	.post(authCtl.verifyToken, authCtl.restrictTo('user'), reviewCtl.setTourAndUserId, reviewCtl.postReview);

router
	.route('/:id')
	.get(reviewCtl.getOneReview)
	.patch(authCtl.restrictTo('user', 'admin'), reviewCtl.updateReview)
	.delete(authCtl.restrictTo('user', 'admin'), reviewCtl.deleteReview);

module.exports = router;
