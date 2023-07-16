const router = require('express').Router();
const { error } = require('console');
const dbh = require('../database/handler');

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

router.post('/login', async (req, res) => {
	const userData = req.body;
	try {
		const sessionID = await dbh.createSession(await dbh.validateUser(userData));
		res.cookie('sessionID', sessionID);
		res.send('logged in');
	} catch (err) {
		if (err) res.status(400).send(err.message);
	}
});

app.post('/logout', async (req, res, next) => {
	await res.clearCookie('sessionId');
	return res.send('Signed out successfully. Mata ne.');
});

router.post('/signup', (req, res) => {
	const userData = req.body.data;
});

module.exports = {
	route: '/',
	router
};
