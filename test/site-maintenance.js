const PORT = 7358;
process.env.PORT = PORT;
global.PARAMS = { test: true, maintenance: true };

const assert = require('assert');
const axios = require('axios');
const server = require('../src/server');

describe("Server (maintenance):", () => {
	before(async () => await server.ready());

	it('should have the right PARAMS object', () => assert.deepEqual(PARAMS, { maintenance: true, mongoless: true, test: true }));

	it(`should render a "Server Under Maintenance" page`, () => {
		axios.get(`http://localhost:${PORT}/`).then(() => Promise.resolve(false)).catch(res => {
			assert(res.response.status === 503);
			assert(res.response.data.includes(`<h1> Server Under Maintenance </h1>`));
		});
	});

	it('should send a "Server Under Maintenance" response', () => {
		axios.post(`http://localhost:${PORT}/`).then(() => Promise.resolve(false)).catch(res => {
			assert(res.response.status === 503);
			assert(res.response.data === 'Server Under Maintenance');
		});
	});

	after(server.close);
});
