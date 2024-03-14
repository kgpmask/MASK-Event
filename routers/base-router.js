const router = require('express').Router();

router.get(['/home', '/'], (req, res) => {
	return res.renderFile('info/landing.njk');
});

router.get('/instructions', (req, res) => {
	return res.renderFile('info/instructions.njk');
});

module.exports = {
	route: '/',
	router
};
