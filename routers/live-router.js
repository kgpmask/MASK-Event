const router = require('express').Router();


router.get('/', (req, res) => {
	// if (req.user.isAdmin) return res.renderFile('live/master.njk');
	res.renderFile('live/participant.njk');
});

router.post('/submit', (req, res) => {

});

router.post('/start', (req, res) => {

});


module.exports = {
	route: '/live',
	router
};
