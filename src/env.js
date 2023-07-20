const fs = require('fs');
const path = require('path');

const aliases = {
	d: 'dev',
	l: 'local',
	m: 'mongoless',
	p: 'prod',
	t: 'test'
};
const validParams = [
	'dev',
	'local',
	'maintenance',
	'mongoless',
	'prod',
	'test'
];

if (!global.PARAMS) {
	if (process.env['NODE_ENV'] === 'production') process.env.prod = true;
	const shorts = new Set();
	const entries = process.argv[1]?.includes('mocha') ? [['test', true]] : process.argv.slice(2).map(arg => {
		if (!validParams.includes(arg)) {
			arg.split('').forEach(a => shorts.add(a));
			return false;
		}
		return [arg, true];
	}).filter(entry => entry);
	shorts.forEach(a => entries.push([aliases[a] || a, true]));
	global.PARAMS = Object.fromEntries(entries);
}

exports.init = () => {
	if (PARAMS.dev && PARAMS.prod) {
		console.log('Production access is disabled with dev mode. Please use the testing DB instead.');
		process.exit(1);
	} else if (PARAMS.local && PARAMS.prod) {
		console.log('Production access conflicts with local mode. Please use only one of these flags.');
		process.exit(1);
	} else if (PARAMS.maintenance) PARAMS.mongoless = true;

	if (!PARAMS.mongoless ) {
		try {
			const file = fs.readFileSync(path.join(
				__dirname,
				`./${process.env.CREDS ? process.env.CREDS + '-' : ''}credentials.json`
			));
			const env = JSON.parse(file);
			for (const property in env) process.env[property] = process.env[property] ?? env[property];
		} catch (e) {
			if (!PARAMS.test) console.log(e.code === 'ENOENT' ? 'Unable to find credentials.json. Starting in mongoless mode.' : e);
			if (!process.env.MONGO_URL && !process.env.MONGO_TEST_URL) {
				console.log('Starting in mongoless mode.');
				PARAMS.mongoless = true;
			}
		}
		if (!PARAMS.prod) process.env.MONGO_URL = PARAMS.local ? 'mongodb://127.0.0.1/mask' : process.env.MONGO_TEST_URL;
	}
};
