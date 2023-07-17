const mongoose = require('mongoose');
const User = require('./Schemas/User');
const Session = require('./Schemas/Session');

async function getUserByUsername (username) {
	return User.findOne({ 'username': `${username}` });
}

async function getUserByUserID (userID) {
	return User.findOne({ '_id': `${userID}` });
}

async function validateUser (userData) {
	console.log(userData);
	const { username, password } = userData;
	const user = await getUserByUsername(username);
	if (!user) throw new Error("User could not be found");
	if (user.password === password) return user._id;
}

async function getUserFromSessionID (sessionId) {
	const session = await Session.findOne({ 'sessionID': sessionId });
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
	// Use this if we want to remoev sessions after logout
	await Session.findOneAndDelete({ 'sessionID': sessionId });
}

/*
To-do

getUserFromSessionID
createUser


removeSession (maybe)
*/

async function createUser (userData) {
	const check = await User.findOne({ "email": userData.email });
	if (check) return new Error("User already exists");
	const user = new User({
		_id: userData.userID || 6969,
		name: userData.name,
		roll: userData.roll,
		phone: userData.phone,
		email: userData.email,
		username: userData.username,
		password: userData.password,
		image: userData.image
	});
	return await user.save();
}

module.exports = {
	validateUser,
	getUserByUsername,
	getUserFromSessionID,
	createSession,
	removeSession,
	createUser
};
