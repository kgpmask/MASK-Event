const bcrypt = require('bcryptjs');

const User = require('./Schemas/User');
const Session = require('./Schemas/Session');

async function createUser (userData) {
	const check = await User.find({ 'email': userData.email })[0];
	console.log(check);
	if (check) throw new Error('User already exists');
	const user = new User({
		_id: userData.userID || 6969,
		name: userData.name,
		roll: userData.roll,
		phone: userData.phone,
		email: userData.email,
		username: userData.username,
		image: userData.image
	});
	user.salt = await bcrypt.genSalt(7);
	user.hash = await bcrypt.hash(userData.password, user.salt);
	await user.save();
	return 'Success';
}

async function getUserByUsername (username) {
	return (await User.find({ 'username': `${username}` }))[0];
}

async function getUserByUserID (userID) {
	return (await User.find({ '_id': `${userID}` }))[0];
}

async function validateUser (userData) {
	// console.log(userData);
	const { username, password } = userData;
	const user = await getUserByUsername(username);
	// console.log(user);
	if (!user) throw new Error('User could not be found');
	if (user.hash === await bcrypt.hash(password, user.salt)) return user._id;
	else throw new Error('Password does not match');
}

async function getUserFromSessionID (sessionId) {
	const session = await Session.find({ 'sessionID': sessionId })[0];
	const user = await getUserByUserID(session.userID);
	if (!user) throw new Error('User Not Found');
	else return user;
}

async function createSession (userId) {
	// 3524: The Goose is Dead
	const sessionId = [3, 5, 2, 4].map(i => (Math.random() + 1).toString(36).substring(2, 2 + i)).join('-');
	const session = new Session({
		userID: userId,
		sessionID: sessionId
	});
	await session.save();
	return sessionId;
}

async function removeSession (sessionId) {
	// Use this if we want to remove sessions after logout
	await Session.findOneAndDelete({ 'sessionID': sessionId });
}

module.exports = {
	createUser,
	validateUser,
	getUserByUsername,
	getUserByUserID,
	getUserFromSessionID,
	createSession,
	removeSession
};
