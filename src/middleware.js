const express = require('express');
const path = require('path');

module.exports = function initMiddleware (app) {
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

	// need to add for login as well

	app.use((req, res, next) => {
		res.renderFile = (files, ctx) => {
			if (!Array.isArray(files)) files = [files];
			return res.render(path.join(__dirname, '../templates', ...files), ctx);
		};

		res.error = err => {
			return res.status(400).send(err?.message || err);
		};

		res.forbidden = () => {
			return res.status(403).renderFile('_error.njk', {
				pagetitle: 'Access Denied',
				message: 'You do not have access to this resource!'
			});
		};

		res.notFound = () => {
			return res.status(404).renderFile('_error.njk', {
				pagetitle: '404',
				message: 'Resource not found!'
			});
		};

		res.tryFile = (path, asset, ctx) => {
			fs.access(path).then(err => {
				if (err) res.notFound();
				else res[asset ? 'sendFile' : 'render'](path, ctx);
			}).catch(() => {
				res.notFound();
			});
		};

		next();
	});

	app.use((req, res, next) => {
		res.locals.mongoless = PARAMS.mongoless;
		// need to add req.loggedIn once we have the login system up and running
		next();
	});
};
