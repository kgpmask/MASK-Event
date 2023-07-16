const cookieParser = require('cookie-parser');
const express = require('express');
const path = require('path');
const dbh = require('../database/handler');

module.exports = function initMiddleware (app) {
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(cookieParser());
	app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

	app.use(async (req, res, next) => {
		try {
			const { sessionID } = req.cookies;
			if (!sessionID) return next();
			req.user = await dbh.getUserFromSessionID(sessionID);
		} catch (err) {
			res.clearCookie('sessionId');
		}
		next();
	});

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
		req.loggedIn = res.locals.loggedIn = req.user ? true : false; // does this work ?
		next();
	});
};
