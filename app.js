const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();

const fileName = path.join(__dirname, 'dev-data', 'data', 'tours-simple.json');

const tours = JSON.parse(fs.readFileSync(fileName));

app.get('/api/v1/tours', (req, res, next) => {
	res.status(200).json({
		status: 'Success',
		results: tours.length,
		data: { tours: tours },
	});
});

const port = 3000;
app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
