const router = require('express').Router();

router.use('/', (req, res) => res.renderFile('auth/login.njk'));

module.exports = {
	route: ['/home', '/'],
	router
};
