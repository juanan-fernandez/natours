//review text, rating, timestamps / ref to the tour / ref. to the user writed
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
	{
		strReview: {
			type: String,
			required: [true, 'Por favor, escriba un texto de al menos 10 caracteres'],
			unique: true,
			trim: true,
			minLength: [5, 'La revisión debe tener al menos 10 caractéres'],
		},
		rating: {
			type: Number,
			required: true,
			default: 5,
			min: [1, 'La puntuación debe ser entre 1 y 5'],
			max: [5, 'La puntuación debe ser entre 1 y 5'],
		},
		tourReview: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Tour',
			required: [true, 'La review debe pertenecer a un Tour válido'],
		},
		userReview: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'La review debe pertenecer a un usuario registrado'],
		},
	}, //opciones
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

reviewSchema.pre(/^find/, function (next) {
	//todas las instrucciones que empiezen por find (find, findOne,...)
	//populate  de varias referencias. (NO INTERESA porque en el tour haremos un populate virtual de las reviews de ese tour) VIDEO 156
	//selecciono nombre del tour y nombre del usuario que hace la review
	//this.populate({ path: 'tourReview', select: 'name' }).populate({ path: 'userReview', select: 'name' });
	this.populate({ path: 'userReview', select: 'name' });
	next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
