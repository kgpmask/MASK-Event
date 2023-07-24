const router = require('express').Router();

router.get('/', (req, res) => {
	res.renderFile('home.njk');
});

module.exports = {
	route: ['/home', '/'],
	router
};
