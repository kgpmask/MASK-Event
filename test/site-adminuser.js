const PORT = 7360;
process.env.PORT = PORT;
global.PARAMS = { test: true };

const assert = require('assert');
const axios = require('axios');

const dbh = require('../database/handler');

global.MIDDLEWARES = [
	// Note: Admin user is a hardcoded user in the database, just like edituser and testuser
	async (req, res, next) => {
		req.user = await dbh.getUserByUsername('adminuser');
		return next();
	}
];

const server = require('../src/server');

before(async function () {
	this.timeout(10_000);
	return await server.ready();
});

const dummyCredential = {
	_id: 7358,
	name: 'Edit Test User',
	roll: '22TS10053',
	phone: 7357001001,
	email: 'testuser@mail.ord',
	username: 'edituser'
};

describe('Server (adminuser):', () => {
	it('Should have the right PARAMS object', () => assert.deepEqual(PARAMS, { test: true }));

	['/list-users', '/edit-user?username=testuser'].forEach(page => it(`Should render ${page} page`,
		() => axios.get(`http://localhost:${PORT}/admin${page}`)
			.then(res => assert(res.status === 200))
	).timeout(3_000));
});

describe('Should prevent signup in case of invalid data', () => {
	const invalidData = [
		{ name: '   ' },
		{ roll: '   ' },
		{ roll: 'someRollNumber' },
		{ roll: '23im10099' },
		{ phone: '   ' },
		{ phone: '7357' },
		{ phone: '101-2023-301' },
		{ email: '   ' },
		{ email: 'email-address' },
		{ username: '   ' },
		{ username: 'XD' },
		{ username: 'Hokuto No Ken' },
		{ username: 'JugemuJugemuGokoNoSurikureKaijarisuigyo...' },
		{ password: '@deku' },
		{ password: 'Tanjiro Kamado' },
		{ password: 'JugemuJugemuGokoNoSurikureKaijarisuigyo...' }
	];
	invalidData.forEach(data => it(`${Object.values(data).pop().trim() ? 'Invalid' : 'Missing' } ${Object.keys(data).pop()}`,
		() => axios.patch(`http://localhost:${PORT}/admin/edit-user`, { ...dummyCredential, ...data })
			.then(() => Promise.resolve(false))
			.catch(({ response }) => assert(response.status === 500))
	).timeout(3_000)
	);
});

describe('Should prevent update on existing unique credentials', () => {
	const existingCreds = [
		{ name: 'testuser' },
		{ roll: '22TS10001' },
		{ email: 'tesuser@mail.co' },
		{ username: 'testuser' }
	];
	existingCreds.forEach(data => it(`Existing ${Object.keys(data).pop()}`,
		() => axios.patch(`http://localhost:${PORT}/admin/edit-user`, { ...dummyCredential, ...data })
			.then(() => Promise.resolve(false))
			.catch(({ response }) => assert(response.status === 500))
	).timeout(3_000)
	);
});

describe('Should successfully update user without changing password', () => {
	const updatedCredential = {
		_id: 7358,
		name: 'Updated',
		roll: '22TS20053',
		email: 'updated@mail.org',
		username: 'updated',
		phone: 7357002001
	};
	it('using existing credential',
		async () => {
			let status;
			status = (await axios.patch(`http://localhost:${PORT}/admin/edit-user`, updatedCredential)).status;
			assert(status === 200);
			const userOnUpdate = await dbh.getUserByUsername(updatedCredential.username);
			Object.keys(updatedCredential).forEach(key => assert.equal(userOnUpdate[key], updatedCredential[key]));
			status = (await axios.patch(`http://localhost:${PORT}/admin/edit-user`, dummyCredential)).status;
			assert(status === 200);
			const userOnRevert = await dbh.getUserByUsername(dummyCredential.username);
			Object.keys(dummyCredential).forEach(key => assert.equal(userOnRevert[key], dummyCredential[key]));
			return true;
		}
	).timeout(10_000);
});

describe('Should successfully update user on changing password', () => {
	const updatedCredential = {
		_id: 7358,
		name: 'Updated',
		roll: '22TS20053',
		email: 'updated@mail.org',
		username: 'updated',
		phone: 7357002001
	};
	it('using existing credential',
		async () => {
			let status;
			status = (await axios.patch(`http://localhost:${PORT}/admin/edit-user`,
				{ ...updatedCredential, password: 'updatedpassword' }
			)).status;
			assert(status === 200);
			const userOnUpdate = await dbh.getUserByUsername(updatedCredential.username);
			Object.keys(updatedCredential).forEach(key => assert.equal(userOnUpdate[key], updatedCredential[key]));
			assert(await dbh.validateUser({ username: 'updated', password: 'updatedpassword' }) === 7358);
			status = (await axios.patch(`http://localhost:${PORT}/admin/edit-user`,
				{ ...dummyCredential, password: 'password' }
			)).status;
			assert(status === 200);
			const userOnRevert = await dbh.getUserByUsername(dummyCredential.username);
			Object.keys(dummyCredential).forEach(key => assert.equal(userOnRevert[key], dummyCredential[key]));
			assert(await dbh.validateUser({ username: 'edituser', password: 'password' }) === 7358);
			return true;
		}
	).timeout(10_000);
});

after(async function () {
	this.timeout(10_000);
	await server.close();
});
