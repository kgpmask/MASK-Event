const router = require('express').Router();

router.use('/', (req, res) => {
	res.renderFile('admin/home.njk');
});

module.exports = {
	route: '/admin',
	router
};
