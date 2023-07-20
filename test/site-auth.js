const PORT = 7359;
process.env.PORT = PORT;
global.PARAMS = { test: true };

const assert = require('assert');
const axios = require('axios');

const server = require('../src/server');
const dbh = require('../database/handler');

before(async () => {
	this.timeout(10_000);
	return await server.ready();
});

const dummyCredential = {
	_id: 7357,
	name: 'Dummy User',
	roll: '22TS10002',
	phone: 7357001001,
	email: 'testuser@mail.com',
	username: 'dummyuser',
	image: '',
	salt: '$2a$07$v98ympfUHTK8gISzk5zT6.',
	hash: '$2a$07$v98ympfUHTK8gISzk5zT6.u1FOLR7IB4e6aqz0BF9OY0a6xVWGkLu',
	__v: 0
};

describe('Server (auth):', () => {
	it('Should have the right PARAMS object', () => assert.deepEqual(PARAMS, { test: true }));
});

describe('Should prevent signup in case of invalid data', () => {
	const invalidData = [
		{ name: '   ' },
		{ roll: '   ' },
		{ roll: 'someRollNumber' },
		{ roll: '23im10099' },
		{ phone: '   ' },
		{ phone: '101-2023-301' },
		{ email: '   ' },
		{ email: 'email-address' },
		{ username: '   ' },
		{ username: 'XD' },
		{ username: 'Hokuto No Ken' },
		{ username: 'JugemuJugemuGokoNoSurikureKaijarisuigyo...' },
		{ password: '   ' },
		{ password: '@deku' },
		{ password: 'Tanjiro Kamado' },
		{ password: 'JugemuJugemuGokoNoSurikureKaijarisuigyo...' }
	];
	invalidData.forEach(data => it(`${Object.values(data).pop().trim() ? 'Invalid' : 'Missing' } ${Object.keys(data).pop()}`,
		() => axios.post(`http://localhost:${PORT}/signup`, { ...dummyCredential, ...data })
			.then(() => Promise.resolve(false))
			.catch(({ response }) => assert(response.status === 500))
	).timeout(process.platform === 'win32' ? 5_000 : 3_000)
	);
});

describe('Should prevent signup for already existing unique fields', () => {
	const overlapCreds = [
		{ username: 'testuser' },
		{ email: 'testuser@mail.co' },
		{ roll: '22TS10001' }
	];
	overlapCreds.forEach(cred => it(`Existing ${Object.keys(cred).pop()}`,
		() => axios.post(`http://localhost:${PORT}/signup`, { ...dummyCredential, ...cred })
			.then(() => Promise.resolve(false))
			.catch(({ response }) => assert(response.status === 500))
	).timeout(process.platform === 'win32' ? 5_000 : 3_000)
	);
});

describe('Should signup for a set of fresh credentials', () => {
	it('Using randomly generated credentials', () => axios.post(`http://localhost:${PORT}/signup`, {
		name: 'Mocha Test',
		roll: '22TS' + [...Array(5)].map(() => Math.floor(10 * Math.random())).join(''),
		phone: 7357001001,
		username: 'user' + [...Array(7)].map(() => Math.floor(10 * Math.random())).join(''),
		password: 'password',
		email: 'mailer' + [...Array(7)].map(() => Math.floor(10 * Math.random())).join('') + '@mail.co'
	}).then(async res => {
		assert(res.status === 200);
		const sessionID = res.headers['set-cookie'].pop().split(';').filter(i => i.includes('sessionID=')).pop().slice(10);
		await dbh.removeUser((await dbh.getUserFromSessionID(sessionID))._id);
		await dbh.removeSession(sessionID);
	})).timeout(process.platform === 'win32' ? 5_000 : 3_000);
});

describe('Should prevent login in case of missing data', () => {
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

	it('Incorrect Password', () => axios.post(`http://localhost:${PORT}/login`,
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
		await dbh.removeSession(sessionID);
	})
).timeout(process.platform === 'win32' ? 5_000 : 3_000)
);

after(async function () {
	server.close();
});
