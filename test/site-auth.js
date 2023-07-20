const PORT = 7359;
process.env.PORT = PORT;
global.PARAMS = { test: true };

const assert = require('assert');
const axios = require('axios');

const server = require('../src/server');
const dbh = require('../database/handler');

describe('Server (auth):', () => {
	before(async () => await server.ready());

	it('Should have the right PARAMS object', () => assert.deepEqual(PARAMS, { test: true }));

	describe('Should prevent signup in case of missing data', () => {
		it('Blank Username', () => axios.post(`http://localhost:${PORT}/login`,
			{ username: '   ', password: 'random' }
		).then(() => Promise.resolve(false)).catch(({ response }) => {
			assert(response.status === 500);
			assert(response.data === 'Error: No Username Provided');
		})
		).timeout(1_000);

		it('Blank Password', () => axios.post(`http://localhost:${PORT}/login`,
			{ username: 'random', password: '   ' }
		).then(() => Promise.resolve(false)).catch(({ response }) => {
			assert(response.status === 500);
			assert(response.data === 'Error: No Password Provided');
		})
		).timeout(1_000);
	});

	describe('Should not login for invalid credentials', () => {
		it('Invalid Username', () => axios.post(`http://localhost:${PORT}/login`,
			{ username: 'test', password: 'random' }
		).then(() => Promise.resolve(false)).catch(({ response }) => {
			assert(response.status === 500);
			assert(response.data === 'Error: User could not be found');
		})
		).timeout(process.platform === 'win32' ? 5_000 : 3_000);

		it('Blank Username', () => axios.post(`http://localhost:${PORT}/login`,
			{ username: 'testuser', password: 'random' }
		).then(() => Promise.resolve(false)).catch(({ response }) => {
			assert(response.status === 500);
			assert(response.data === 'Error: Password does not match');
		})
		).timeout(process.platform === 'win32' ? 5_000 : 3_000);
	});

	describe('Should login to test user successfully', () => it('With test user credentials',
		() => axios.post(`http://localhost:${PORT}/login`,
			{ username: 'testuser', password: 'password' }
		).then(async res => {
			assert(res.status === 200);
			const sessionID = res.headers['set-cookie'].pop().split(';').filter(i => i.includes('sessionID=')).pop().slice(10);
			assert.deepEqual(await dbh.getUserFromSessionID(sessionID), await dbh.getUserByUsername('testuser'));
		})
	).timeout(process.platform === 'win32' ? 5_000 : 3_000)
	);
	after(server.close);
});
