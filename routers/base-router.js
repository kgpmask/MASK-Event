const router = require('express').Router();

router.get(['/home', '/'], (req, res) => {
	return res.renderFile('info/landing.njk');
});

router.get('/information', (req, res) => {
	return res.renderFile('info/information.njk');
});

module.exports = {
	route: '/',
	router
};
