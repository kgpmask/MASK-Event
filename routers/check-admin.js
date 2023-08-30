const router = require('express').Router();

router.use('/', (req, res, next) => {
	if (!req.isAdmin) return req.method === 'GET' ? res.forbidden() : res.status(403).send('Forbidden: Not Authorized');
	return next();
});

module.exports = router;
