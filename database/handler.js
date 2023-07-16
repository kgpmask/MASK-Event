const mongoose = require('mongoose');
const User = require('./Schemas/User');
const Session = require('./Schemas/Session');

async function getUserByUsername (username) {
	return User.findOne({ 'username': `${username}` });
}

async function getUserByUserID (userID) {
	return User.findOne({ 'userID': `${userID}` });
}

async function validateUser (userData) {
	console.log(userData);
	const { username, password } = userData;
	const user = await getUserByUsername(username);
	if (!user) throw new Error("User could not be found");
	if (user.password === password) return user.userID;
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

module.exports = {
	validateUser,
	getUserByUsername,
	getUserFromSessionID,
	createSession,
	removeSession
};
