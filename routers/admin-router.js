const router = require('express').Router();
const dbh = require('../database/handler');
const { body, validationResult } = require('express-validator');
const checkAdmin = require('./check-admin');

const teams = require('../src/samples/teams.json');
const riddleQuestions = require('../src/samples/riddleQuestions.json');

router.use('/', checkAdmin);

router.get('/', (req, res) => {
	res.renderFile('admin/_admin.njk');
});

router.get('/edit-team', async (req, res) => {
	const teamID = parseInt(req.query.teamID);
	const team = teams.find(team => team._id === teamID);
	return res.renderFile('admin/team-edit.njk', {
		team
	});
});

router.patch('/edit-team', [
	body('id')
		.isNumeric()
		.trim()
		.notEmpty().withMessage('No ID Provided'),
	body('teamName')
		.trim()
		.notEmpty().withMessage('No Name Provided')
], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorMessages = errors.array().map(error => error.msg);
		throw new Error(errorMessages[0]);
	}
	// const team = {
	// 	id: req.body.id,
	// 	name: req.body.teamName,
	// 	members: [
	// 		{ name: req.body.name1, email: req.body.email1, phone: req.body.phone1 },
	// 		{ name: req.body.name2, email: req.body.email2, phone: req.body.phone2 },
	// 		{ name: req.body.name3, email: req.body.email3, phone: req.body.phone3 }
	// 	]
	// };
	// const teamIndex = teams.findIndex(t => t.id === team.id);
	// if (teamIndex === -1) {
	// 	teams.push(team);
	// }
	// teams[teamIndex] = team;
	return res.status(200).send('Edited Successfully');
});


router.get('/list-users', async (req, res) => {
	const users = await dbh.getUsers();
	res.renderFile('admin/user-list.njk', { users });
});

// router.get('/edit-user', async (req, res) => {
// 	const username = req.query.username;
// 	if (!username) return res.redirect('/admin/list-users');
// 	const data = (await dbh.getUserByUsername(username)).toObject();
// 	delete data.salt;
// 	delete data.hash;
// 	res.renderFile('admin/user-edit.njk', { ...data });
// });

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
