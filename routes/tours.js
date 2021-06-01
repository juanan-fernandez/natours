const express = require('express');
const toursCtlr = require('../controllers/tours');

const router = express.Router();

// router.param('id', (req, res, next, val) => {
// 	//podemos usar este middleware para validar el id que recibimos:
//    //como en el ejemplo más abajo
// 	console.log(`Id is ${val}`);
// 	next();
// });

router.param('id', toursCtlr.checkId);

//Routes
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//otra forma de hacerlo
router.route('/').get(toursCtlr.getAllTours).post(toursCtlr.checkBodyTour, toursCtlr.createTour);
router.route('/:id').get(toursCtlr.getTour).patch(toursCtlr.updateTour).delete(toursCtlr.deleteTour);

module.exports = router;