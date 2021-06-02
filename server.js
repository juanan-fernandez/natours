//env variables
require('dotenv').config();

const app = require('./app');

//Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
