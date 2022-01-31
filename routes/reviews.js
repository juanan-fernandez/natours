const express = require('express');
const reviewCtl = require('../controllers/review.js');
const authCtl = require('../controllers/auth');
const router = express.Router({ mergeParams: true }); //video 158. con esta opción recoge los parámetros que pasan en el prefijo.

//solamente pueden crear reviews los usuarios autenticados y con rol 'user'
//router.post('/', authCtl.verifyToken, authCtl.restrictTo('user'), reviewCtl.postReview);
router
	.route('/')
	.get(reviewCtl.filterReviewByTour, reviewCtl.getReviews)
	.post(authCtl.verifyToken, authCtl.restrictTo('user'), reviewCtl.setTourAndUserId, reviewCtl.postReview);

router.route('/:id').get(reviewCtl.getOneReview).delete(reviewCtl.deleteReview).patch(reviewCtl.updateReview);

module.exports = router;
