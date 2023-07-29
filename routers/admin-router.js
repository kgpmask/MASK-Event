const router = require('express').Router();
const dbh = require('../database/handler');
const { body, validationResult } = require('express-validator');

router.use('/', (req, res, next) => {
	if (!req.user?.isAdmin) return req.method === 'GET' ? res.forbidden() : res.status(403).send('Forbidden: Not Authorized');
	return next();
});

router.get('/', (req, res) => {
	res.renderFile('admin/_admin.njk');
});

router.get('/list-users', async (req, res) => {
	const users = await dbh.getUsers();
	res.renderFile('admin/user-list.njk', { users });
});

router.get('/edit-user', async (req, res) => {
	const username = req.query.username;
	if (!username) return res.redirect('/admin/list-users');
	const data = (await dbh.getUserByUsername(username)).toObject();
	delete data.salt;
	delete data.hash;
	res.renderFile('admin/user-edit.njk', { ...data });
});

router.patch('/edit-user', [
	body('name')
		.trim()
		.notEmpty().withMessage('No Name Provided'),
	body('roll')
		.trim()
		.notEmpty().withMessage('No Roll Provided')
		.matches(/^[12][890123][A-Z]{2}[0-9][A-Z0-9]{2}\d\d$/i).withMessage('Please provide a valid roll number'),
	body('email')
		.trim()
		.notEmpty().withMessage('No Email Provided')
		.isEmail().withMessage('Please provide a valid email'),
	body('phone')
		.trim()
		.notEmpty().withMessage('No Phone Number Provided')
		.isMobilePhone('en-IN').withMessage('Please provide a valid phone number'),
	body('username')
		.trim()
		.notEmpty().withMessage('No Username Provided')
		.isLength({ min: 3, max: 32 }).withMessage('Username must be between 3 and 32 characters long.')
		.matches(/^\S+$/).withMessage('Username cannot contain whitespaces'),
	body('password')
		.trim()
		.notEmpty().withMessage('No Password Provided')
		.isLength({ min: 6, max: 32 }).withMessage('Password must be between 6 and 32 characters long.')
		.matches(/^\S+$/).withMessage('Password cannot contain whitespaces')
		.optional({ values: 'falsy' })
], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorMessages = errors.array().map(error => error.msg);
		throw new Error(errorMessages[0]);
	}
	await dbh.editUser(req.body);
	return res.send('Edited Successfully');
});

module.exports = {
	route: '/admin',
	router
};
