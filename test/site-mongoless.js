const PORT = 7357; // TEST, get it?
process.env.PORT = PORT;
global.PARAMS = { test: true, mongoless: true };

const assert = require('assert');
const axios = require('axios');
const server = require('../src/server');

const pages = [''];

describe("Server (mongoless):", () => {
	before(async () => await server.ready());

	it('should have the right PARAMS object', () => assert.deepEqual(PARAMS, { mongoless: true, test: true }));

	pages.forEach(page => it(`should render ${page}`, () => axios.get(`http://localhost:${PORT}/${page}`))
		.timeout(process.platform === 'win32' ? 5_000 : 3_000)
	);

	after(server.close);
});
