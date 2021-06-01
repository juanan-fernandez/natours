const express = require('express');

const router = express.Router();

const toursCtlr = require('../controllers/tours');

//Routes
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//otra forma de hacerlo
router.route('/').get(toursCtlr.getAllTours).post(toursCtlr.createTour);
router.route('/:id').get(toursCtlr.getTour).patch(toursCtlr.updateTour).delete(toursCtlr.deleteTour);

module.exports = router;
