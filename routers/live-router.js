const router = require('express').Router();


router.get('/live', (req, res) => {
	res.renderFile('live_master.njk');
});

module.exports = {
	route: '/',
	router
};
