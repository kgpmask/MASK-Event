const bcrypt = require('bcryptjs');
const User = require('./Schemas/User');
const Session = require('./Schemas/Session');
const Questions = require('./Schemas/Questions');
const Records = require('./Schemas/Records');

async function createUser (userData) {
	const _id = userData.userID ?? (await User.find({ _id: { '$gt': 10000 } })).length + 10001;
	const user = new User({
		_id,
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
	return user._id;
}

async function editUser (userData) {
	const user = await User.findById(userData._id);
	if (!user) throw new Error('Invalid User ID');
	user.name = userData.name;
	user.roll = userData.roll;
	user.phone = userData.phone;
	user.email = userData.email;
	user.username = userData.username;
	if (userData.password) {
		user.hash = await bcrypt.hash(userData.password, user.salt);
	}
	return await user.save();
}

async function getUsers () {
	return await User.find({ _id: { $gt: 10000 } }).lean();
}

async function getUserByUsername (username) {
	return await User.findOne({ 'username': `${username}` });
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
	const session = await Session.findById(sessionId);
	const user = await User.findById(session.userID);
	if (!user) throw new Error('User Not Found');
	else return user;
}

async function createSession (userId) {
	// 3374: You Are Already Dead
	const sessionId = [3, 3, 7, 4].map(i => (Math.random() + 1).toString(36).substring(2, 2 + i)).join('-');
	const session = new Session({
		_id: sessionId,
		userID: userId
	});
	await session.save();
	return sessionId;
}

// async function createDummySession () {
// 	return new Session({
// 		_id: 'you-are-already-dead',
// 		userID: 7357
// 	});
// }

async function removeSession (sessionId) {
	// Use this if we want to remove sessions after logout
	await Session.findByIdAndDelete(sessionId);
}

async function removeUser (id) {
	await User.findByIdAndDelete(id);
	return 'Test User Deleted';
}

async function getLiveQuiz (query) {
	// TODO: Use IDs as a parameter properly
	const title = query || 'SQ1';
	// The first live quiz
	const quiz = await Questions.findOne({ "title": title });
	if (quiz) return quiz.toObject();
}

async function getLiveResult (userId, quizId, questionNo) {
	const data = await Records.findOne({ userId, quizId, questionNo });
	if (data) return data.toObject();
}

async function getAllLiveResults (quizId) {
	return await LiveResult.find({ quizId }).lean();
}

async function addLiveResult (userId, quizId, questionNo, response) {
	const user = await getUser(userId);
	const results = new Records({
		userId,
		quizId,
		questionNo,
		response
	});
	await results.save();
	return results.toObject();
}

module.exports = {
	createUser,
	editUser,
	getUsers,
	getUserByUsername,
	validateUser,
	getUserFromSessionID,
	createSession,
	// createDummySession,
	removeSession,
	removeUser,
	getLiveQuiz,
	getLiveResult,
	getAllLiveResults,
	addLiveResult
};
