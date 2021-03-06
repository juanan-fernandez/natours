const express = require('express');
const toursCtlr = require('../controllers/tour');
const authCtlr = require('../controllers/auth');
const reviewRoutes = require('./reviews');

const router = express.Router();

//VIDEO 158
//rutas anidadas para las reviews (para crear una review dentro de un tour)
router.use('/:tourId/reviews', reviewRoutes);

//lo siguiente también sería válido,. .pero es mejor tener las rutas en un único fichero de rutas
// router
// 	.route('/:tourId/reviews')
// 	.post(authCtlr.verifyToken, authCtlr.restrictTo('user'), reviewCtl.postReview)
// 	.get(reviewCtl.getReviews);
// //one review
// router.route('/:tourId/reviews/:id').get(reviewCtl.getOneReview);

//podemos usar este middleware para validar el id que recibimos por parámetro
//router.param('id', toursCtlr.checkId);

//Routes
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//otra forma de hacerlo
router.route('/top-five').get(toursCtlr.aliasTopFive, toursCtlr.getAllTours);
router.route('/tour-stats').get(toursCtlr.getTourStats);
router.route('/tour-plan/:year').get(toursCtlr.getMonthPlan);
router.route('/').get(authCtlr.verifyToken, toursCtlr.getAllTours).post(toursCtlr.createTour);

//Pruebas
router.route('/test').get(toursCtlr.getTheTours);
router.route('/count').get(toursCtlr.getNumberOfDocs);

router
	.route('/:id')
	.get(toursCtlr.getTour)
	.patch(toursCtlr.updateTour)
	.delete(authCtlr.verifyToken, authCtlr.restrictTo('admin', 'leader-guide'), toursCtlr.deleteTour);

module.exports = router;
