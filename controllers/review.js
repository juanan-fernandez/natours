const Review = require('../models/reviews');
//const QueryBuilder = require('../utils/queryBuilder');
//const appError = require('../utils/appError');
const factoryFn = require('./handlerFactory');

const setTourAndUserId = (req, res, next) => {
	req.body.userReview = req.user._id;
	req.body.tourReview = req.params.tourId;
	next();
};

const postReview = factoryFn.createOne(Review);
const updateReview = factoryFn.updateOneById(Review);
const deleteReview = factoryFn.deleteOneById(Review);
const getOneReview = factoryFn.getOneById(Review);

const filterReviewByTour = (req, res, next) => {
	if (req.params.tourId) req.query.tourReview = req.params.tourId;
	next();
};

const getReviews = factoryFn.getAll(Review);

module.exports = {
	filterReviewByTour,
	getReviews,
	setTourAndUserId,
	postReview,
	getOneReview,
	deleteReview,
	updateReview,
};

//sin usar las funciones generales factoryFn
// const postReview = async (req, res, next) => {
// 	const reviewData = { ...req.body, userReview: req.user._id, tourReview: req.params.tourId }; //pongo el usuario que está logeado insertando la review

// 	const newReview = Review(reviewData);
// 	try {
// 		const review = await newReview.save();
// 		res.status(200).json({
// 			data: { review },
// 		});
// 	} catch (err) {
// 		next(err);
// 	}
// };

// const getReviews = async (req, res, next) => {
// 	if (req.params.tourId) req.query.tourReview = req.params.tourId;
// 	const reviewQuery = new QueryBuilder(Review.find(), req.query);
// 	try {
// 		const reviews = await reviewQuery.filter().sort().select().paginate().query;
// 		res.status(200).json({
// 			status: 'Success',
// 			results: reviews.length,
// 			data: { reviews: reviews },
// 		});
// 	} catch (err) {
// 		next(err);
// 	}
// };

// const getOneReview = async (req, res, next) => {
// 	try {
// 		const review = Review.findById(req.params.id);
// 		res.status(200).json({
// 			status: 'Success',
// 			data: { review },
// 		});
// 	} catch (err) {
// 		next(err);
// 	}
// };
