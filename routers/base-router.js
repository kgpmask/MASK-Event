const router = require('express').Router();

router.get('/', (req, res) => {
	res.renderFile('info/landing.njk');
});

module.exports = {
	route: ['/home', '/'],
	router
};
