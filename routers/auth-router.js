const router = require('express').Router();
const { error } = require('console');
const dbh = require('../database/handler');
const { body, validationResult } = require('express-validator');

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

router.post('/login', [
	body('username')
		.notEmpty().withMessage('No Username Provided')
		.trim(),
	body('password')
		.notEmpty().withMessage('No Username Provided')
		.trim()
], async (req, res) => {
	const userData = req.body;
	const sessionID = await dbh.createSession(await dbh.validateUser(userData));
	res.cookie('sessionID', sessionID);
	res.send('logged in');
});

router.post('/signup', [
	body('name')
		.trim()
		.notEmpty().withMessage('No Name Provided'),
	body('roll')
		.trim()
		.notEmpty().withMessage('No Roll Provided'),
	body('phone')
		.trim()
		.notEmpty().withMessage('No Phone Number Provided')
		.isMobilePhone('en-IN').withMessage('Please provide a valid phone number'),
	body('email')
		.trim()
		.notEmpty().withMessage('No Email Provided')
		.isEmail().withMessage('Please provide a valid email'),
	body('username')
		.trim()
		.notEmpty().withMessage('No Username Provided')
		.isLength({ min: 3, max: 32 }).withMessage('Username must be between 3 and 32 characters long.'),
	body('password')
		.trim()
		.notEmpty().withMessage('No Password Provided')
		.isLength({ min: 6, max: 32 }).withMessage('Password must be between 6 and 32 characters long.')
		.matches(/^\S+$/).withMessage('Password cannot contain whitespaces')
], async (req, res) => {
	await dbh.createUser(req.body);
	res.redirect('/');
});

app.post('/logout', async (req, res, next) => {
	// If we may require them, then...
	// const { sessionId } = req.cookies;
	// await db.removeSession(sessionId);
	if (req.loggedIn) return res.error('Stop trying to break the website ;-;');
	await res.clearCookie('sessionID');
	return res.send('Signed out successfully. Mata ne.');
});

module.exports = {
	route: '/',
	router
};
