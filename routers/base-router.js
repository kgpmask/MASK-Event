const router = require('express').Router();

router.use('/', (req, res) => res.renderFile('register.njk'));

module.exports = {
	route: ['/home', '/'],
	router
};
