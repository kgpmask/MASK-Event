const router = require('express').Router();

router.use('/', (req, res) => res.renderFile('auth/signup.njk'));

module.exports = {
	route: ['/home', '/'],
	router
};
