const mongo = require('mongoose');

class QueryBuilder {
	constructor(query, queryString) {
		//en query recibo el objeto que provee el modelo de mongo
		this.query = query;
		//en queryString se recibe un objeto de express que contiene toda la info de los parametros que van en la url
		this.queryString = queryString;
		this.nDocs = 0;
	}

	getQueryStr() {
		let queryObj = { ...this.queryString };
		//eliminar las palabras claves de la consulta
		const keyWords = ['sort', 'limit', 'fields', 'page'];
		keyWords.forEach((k) => delete queryObj[k]);
		//ahora tenemos que revisar los operadores que pueden venir en la consulta
		//lt, lte, gt, gte
		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(
			/\b(lt|lte|gt|gte)\b/g,
			(match) => `$${match}`,
		);
		return queryStr;
	}

	filter() {
		this.query = this.query.find(JSON.parse(this.getQueryStr()));
		//this.countDocs();
		return this;
	}

	countDocs() {
		this.query = this.query.countDocuments(JSON.parse(this.getQueryStr()));
		return this;
	}

	sort() {
		if (this.queryString.sort) {
			const sortBy = this.queryString.sort.split(',').join(' ');
			this.query = this.query.sort(sortBy);
		} else {
			this.query = this.query.sort('-createdAt');
		}
		return this;
	}

	select() {
		if (this.queryString.fields) {
			const fields = this.queryString.fields.split(',').join(' ');
			this.query = this.query.select(fields);
		} else {
			this.query = this.query.select('-__v'); //excluir un campo
		}
		return this;
	}

	paginate() {
		const page = +this.queryString.page || 1;
		const limit = +this.queryString.limit || 1000;
		// if (page * limit > nDocs) {
		// 	page = +(nDocs / limit).toFixed() + (1 * (nDocs % limit ? 1 : 0));
		// }
		// query = query.skip(limit * page - limit).limit(limit);
		const skip = (page - 1) * limit;
		this.query = this.query.skip(skip).limit(limit);
		return this;
	}
}

module.exports = QueryBuilder;
