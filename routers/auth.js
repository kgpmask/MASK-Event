const router = require('express').Router();

router.get('/login', (req, res) => {
	if (req.loggedIn) return res.redirect('/');
	return res.renderFile('login.njk');
});

router.get('/logout', (req, res) => {
	if (!req.loggedIn) return res.redirect('/login');
	return res.renderFile('logout.njk');
});

router.get('/signup', (req, res) => {
	if (req.loggedIn) return res.redirect('/');
	return res.renderFile('signup.njk');
});

// Post requests here

module.exports = {
	route: '/',
	router
};
