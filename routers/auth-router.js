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
	const sessionID = await dbh.createSession(await dbh.validateUser(userData));
	res.cookie('sessionID', sessionID);
	res.send('logged in');
});

router.post('/signup', async (req, res) => {
	await dbh.createUser(req.body);
	res.redirect('/');
});

app.post('/logout', async (req, res, next) => {
	// If we may require them, then...
	// const { sessionId } = req.cookies;
	// await db.removeSession(sessionId);
	await res.clearCookie('sessionID');
	return res.send('Signed out successfully. Mata ne.');
});

router.post('/signup', (req, res) => {
	const userData = req.body.data;
});

module.exports = {
	route: '/',
	router
};
