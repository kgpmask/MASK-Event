const fs = require('fs').promises;
const path = require('path');

module.exports = async function router (app, nunjEnv) {
	if (PARAMS.maintenance) app.use((req, res) => {
		return req.method === 'GET' ? res.status(503).renderFile('maintenance.njk') : res.status(503).send('Server Under Maintenance');
	});

	const routerFiles = (await fs.readdir(path.join(__dirname, '../routers'))).filter(f => f.includes('-router.js'));
	routerFiles.forEach(routerFile => {
		const { route, router } = require(`../routers/${routerFile}`);
		app.use(route, router);
	});

	app.use('/rebuild', (req, res) => {
		nunjEnv.loaders.forEach(loader => loader.cache = {});
		// ['./rewards.json'].forEach(cache => delete require.cache[require.resolve(cache)]);
		return res.renderFile('rebuild.njk');
	});

	app.use('/error', async () => {
		throw new Error('Sensitive error');
	});


	app.use((req, res, next) => {
		// If propagation hasn't stopped, switch to GET!
		if (req.method === "POST") {
			return res.redirect(req.url);
		}
		next();
	});
	app.use((req, res, next) => {
		// Catch-all 404
		res.notFound();
	});

	app.use((err, req, res, next) => {
		if (PARAMS.dev) console.error(err.stack);
		// Make POST errors show only the data, and GET errors show the page with the error message
		res.status(500);
		if (req.method === "GET")
			res.renderFile("_error.njk");
		else res.send(err.toString());
	});
};
