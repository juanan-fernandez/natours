const mongoose = require('mongoose');
const slugify = require('slugify');
//const User = require('./user'); video 151
const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'The tour must have a name. This field is mandatory'],
			unique: true,
			trim: true,
			minLength: [10, 'The name must have 10 characters at least'],
			validate: {
				validator: function (value) {
					return /^[\D]+$/.test(value);
				},
				message: 'The name must only contains letters.',
			},
		},
		startLocation: {
			//GeoJson
			type: {
				type: String,
				default: 'Point',
				enum: ['Point'],
			},
			coordinates: [Number], //long, lat
			address: String,
			description: String,
		},
		locations: [
			{
				//GeoJson
				type: {
					type: String,
					default: 'Point',
					enum: ['Point'],
				},
				coordinates: [Number], //long, lat
				address: String,
				description: String,
				day: Number,
			},
		],
		slug: String,
		guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
		duration: {
			type: Number,
			required: [true, 'The tour must have a duration of 1 day min.'],
			min: 1,
		},
		maxGroupSize: {
			type: Number,
			required: [true, 'The tour must have a group size of 1 min and 25 max.'],
		},
		difficulty: {
			type: String,
			required: [true, 'The tour must have a difficulty'],
			lowercase: true,
			enum: {
				values: ['easy', 'medium', 'difficult'], //video 107
				message: 'Difficulty is either: easy, medium, difficult',
			},
		},
		ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [1, 'Rating must be above 1.0'],
			max: [5, 'Rating must be below 5.0'],
			set: val => Math.round(val * 10) / 10, //val=4.666 * 10 => round(46.66) => 47 / 10 => 4.7
		},
		ratingsQuantity: {
			type: Number,
			default: 0,
		},
		rating: {
			type: Number,
			default: 1,
		},
		price: {
			type: Number,
			required: [true, 'The tour must have a price greater than zero.'],
			min: 1,
		},
		priceDiscount: {
			type: Number,
			validate: {
				validator: function (value) {
					//this solamente es válido en la creación de nuevos documnentos (no update)
					return this.price > value;
				},
				message: props => `The discount of the tour (${props.value}) must be lower than the price`,
			},
		},
		summary: {
			type: String,
			trim: true,
		},
		description: {
			type: String,
			trim: true,
			required: [true, 'The tour must have a description'],
		},
		imageCover: {
			type: String,
			required: [true, 'The tour must have a cover image'],
		},
		images: [String],
		startDates: [Date],
		vip: {
			type: Boolean,
			default: false,
			select: false, //si no queremos que este campo aparezca en ninguna busqueda
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

//tourSchema.index({ price: 1 }); //establecemos un index en el precio porque es una búsqueda habitual

//si creamos un indice compuesto no es necesario crear luego los indices individuales para cada campo
tourSchema.index({ price: 1, ratingsAverage: -1 }); //indice compuesto por precio ascendente y ratings descendente.
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
//embeding: incluir el documento completo de usuario en el array de guias
//no vamos a hacer lo así. guardaremos solamente el id.
// tourSchema.pre('save', async function (next) {
// 	const guidesPromises = this.guides.map(async guideId => await User.findById(guideId));
// 	this.guides = await Promise.all(guidesPromises);
// 	next();
// });

tourSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

tourSchema.pre(/^find/, function (next) {
	//todas las instrucciones que empiezen por find (find, findOne,...)
	//populate todos los guias que aparezcan en el array de guías del documento tour (video 152)
	//selecciono todos los campos del documento usuario excepto los que tienen delante el -
	this.populate({ path: 'guides', select: '-__v -passwordChangedAt' });
	this.startQuery = Date.now();
	next();
});

//query middleware.  ojo con esto,.. me está filtrando ya los que vip <>true
//tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
	//todas las instrucciones que empiezen por find (find, findOne,...)
	//this.find({ vip: { $ne: true } }); //pre-filtro (video 105)
	//this.find();
	this.startQuery = Date.now();
	next();
});

tourSchema.post(/^find/, function (next) {
	console.log(`The query has finished in ${Date.now() - this.startQuery} ms.`);
});

//Aggregation middleware.
tourSchema.pre('aggregate', function (next) {
	this.pipeline().unshift({ $match: { vip: { $ne: true } } });
	console.log(this.pipeline());
	next();
});

//campos virtuales o campos cálculados
tourSchema.virtual('durationWeeks').get(function () {
	return this.duration / 7;
});

//virtual populate (video 156)
tourSchema.virtual('reviews', {
	ref: 'Review', //nombre del modelo Review
	foreignField: 'tourReview', //nombre del campo en el modelo Review
	localField: '_id', //nombre del campo de Tour que enlaza con Review
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
