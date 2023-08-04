const router = require('express').Router();

router.get('/', (req, res) => {
	// if (req.user.isAdmin) return res.renderFile('live/master.njk');
	res.renderFile('live/participant.njk');
});

router.post('/submit', (req, res) => {
	if (req.user.isAdmin) return res.send('admins are not allowed here ;-;');
	const answer = req.body.submitted;
});

module.exports = {
	route: '/live',
	router
};
