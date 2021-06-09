class Querybuilder {
	constructor(query, queryString) {
		//en query recibo el objeto que provee el modelo de mongo
		this.query = query;
		//en queryString se recibe un objeto de express que contiene toda la info de los parametros que van en la url
		this.queryString = queryString;
	}

	filter() {
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
		this.query = this.query.find(JSON.parse(queryStr));
		return this;
	}
}
