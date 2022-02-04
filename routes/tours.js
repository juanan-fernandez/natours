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
router
	.route('/tour-plan/:year')
	.get(authCtlr.verifyToken, authCtlr.restrictTo('admin', 'leader-guide'), toursCtlr.getMonthPlan);

//que tours se comienzan en una localización a una distancia de unas cordenadas dadas
//tours-distance/233/center/-40,45/unit/mi
router.route('/tours-distance/:distance/center/:latlng/unit/:unit').get(toursCtlr.getGeoSpatial);

//obtener la distancia de todos los tours a un punto dado
router.route('/tours-from/:latlng/unit/:unit').get(toursCtlr.getGeoDistance);

router.route('/').get(toursCtlr.getAllTours).post(authCtlr.verifyToken, toursCtlr.createTour);

//Pruebas
router.route('/test').get(toursCtlr.getTheTours);
router.route('/count').get(toursCtlr.getNumberOfDocs);

router
	.route('/:id')
	.get(toursCtlr.getTour)
	.patch(authCtlr.verifyToken, authCtlr.restrictTo('admin', 'leader-guide'), toursCtlr.updateTour)
	.delete(authCtlr.verifyToken, authCtlr.restrictTo('admin', 'leader-guide'), toursCtlr.deleteTour);

module.exports = router;
