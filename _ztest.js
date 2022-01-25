const shape = {
	radius: 10,
	diameter: function () {
		return this.radius * 2;
	},
	perimeter: () => {
		console.log(this);
		return 2 * Math.PI * this.radius;
	},
};

console.log(shape.diameter());
console.log(shape.perimeter());
