const express = require('express');

const app = express();

app.get('/api/v1/tours', (req, res, next) => {
	res.status(200).json({
		message: 'Hello from the other side...',
		applicacion: 'Natours',
	});
});

const port = 3000;
app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
