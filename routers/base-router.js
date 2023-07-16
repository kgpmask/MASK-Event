const router = require('express').Router();

router.use('/', (req, res) => {
	res.renderFile('home.njk');
});

module.exports = {
	route: ['/home', '/'],
	router
};
