const router = require('express').Router();
const dbh = require('../database/handler');

router.use('/', (req, res, next) => {
	if (!req.user?.isAdmin) return req.method === 'GET' ? res.forbidden() : res.status(403).send('Forbidden: Not Authorized');
	return next();
});

router.get('/', (req, res) => {
	res.renderFile('admin/_admin.njk');
});

router.get('/list-users', async (req, res) => {
	const users = await dbh.getUsers();
	res.renderFile('admin/user-list.njk');
});

router.get('/edit-user', (req, res) => {
	res.renderFile('admin/user-edit.njk');
});

module.exports = {
	route: '/admin',
	router
};
