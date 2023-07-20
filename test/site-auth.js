const axios = require('axios');
const assert = require('assert');
const DB = require('../database/database');
const dbh = require('../database/handler');
const PORT = 7359;
global.PARAMS = { test: true };

let db;

before(async function () {
	db = await DB.init();
});

describe('Database connection', () => {
	it('should be connected', () => assert(db.connection.readyState));
});

describe('User', () => {

	it('should be able to register a test user', async function () {
		await axios.post(`http://localhost:${PORT}/signup`,
			{
				_id: 6969,
				name: 'goos',
				roll: '23XX69420',
				username: 'deadgoos',
				phone: '1234567890',
				email: 'deadgoos@kgpmask.club',
				password: 'AsIfImmaLeakMyPassword'
			}
		).then(res => {
			assert(res.status === 200);
			assert(res.data === 'Registered Successfully UwU');
		});
	}
	).timeout(process.platform === 'win32' ? 5_000 : 3_000);

	it('should login to test user', () => axios.post(`http://localhost:${PORT}/login`,
		{ username: 'dedgoos', password: 'AsIfImmaLeakMyPassword' }
	).then(async res => {
		// console.log(res);
		assert(res.status === 200);
		assert(res.data === 'logged in >w<');
		const sessionID = res.headers['set-cookie'].pop().split(';').filter(i => i.includes('sessionID=')).pop().slice(10);
		assert.deepEqual(await dbh.getUserFromSessionID(sessionID), await dbh.getUserByUsername('dedgoos'));
	})
	).timeout(process.platform === 'win32' ? 5_000 : 3_000);
});



after(async function () {
	await dbh.removeTestUser;
	DB.disconnect();
});
