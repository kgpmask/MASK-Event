const router = require('express').Router();

router.use('/', (req, res) => res.renderFile('login.njk'));

module.exports = {
	route: ['/home', '/'],
	router
};
