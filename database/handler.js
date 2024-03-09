const bcrypt = require('bcryptjs');
const User = require('./Schemas/User');
const Session = require('./Schemas/Session');
const Questions = require('./Schemas/Questions');
const Records = require('./Schemas/Records');
const Results = require('./Schemas/Results');
// Treasure Hunt stuff
const Location = require('./Schemas/Location');
const Team = require('./Schemas/Team');
const TeamSession = require('./Schemas/TeamSession');

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

async function updateImage (username, image) {
	const user = await getUserByUsername(username);
	if (!user) throw new Error('Invalid User');
	user.image = image;
	return await user.save();
}

async function getUsers () {
	return await User.find({ _id: { $gt: 10000 } }).lean();
}

async function genUserMap () {
	const data = await getUsers();
	const map = {};
	data.forEach(ele => {
		map[ele._id] = [ele.username, ele.name];
	});
	return map;
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
	const title = query || new Date().toISOString().slice(0, 10);
	// The first live quiz
	const quiz = await Questions.findOne({ "title": title });
	if (quiz) return quiz.toObject();
}

async function getLiveRecord (userId, quizId, questionNo) {
	const data = await Records.findOne({ userId, quizId, questionNo });
	if (data) return data.toObject();
}

async function getAllLiveRecords (quizId) {
	return await Records.find({ quizId }).lean();
}

async function addLiveRecord (userId, quizId, questionNo, response) {
	const user = await User.findById(userId);
	if (!user) throw new Error('Invalid UserID');
	const results = new Records({
		userId,
		quizId,
		questionNo,
		response
	});
	await results.save();
	return results.toObject();
}

async function addLiveResult (userId, quizId, points) {
	const result = await Results.findOne({ userId });
	if (!result) {
		const data = new Results({
			userId,
			quizId,
			points
		});
		await data.save();
		return data.toObject();
	}
	result.points = points;
	await result.save();
	return result.toObject();
}

async function updateLiveResult (userId, quizId, points) {
	const result = await Results.findOne({ userId });
	if (!result) {
		const data = new Results({
			userId,
			quizId
		});
		data.points = points;
		await data.save();
		return data.toObject();
	}
	result.points = result.points + points;
	await result.save();
	return result.toObject();
}

async function getLiveResults (quizId) {
	return await Results.find({ quizId }).lean().sort({ 'points': -1 });
}

// Treasure Hunt Methods

async function getLocations () {
	return await Location.find().lean();
}

async function getTeams () {
	return await Team.find({ isAdmin: [undefined, false] }).lean();
}

async function getTeamById (_id) {
	return await Team.findById(_id);
}

async function validateTeam ({ username: teamId, password }) {
	const team = await Team.findById(~~teamId);
	if (!team) throw new Error('Team could not be found');
	if (team.password === password) return team._id;
	else throw new Error('Password does not match');
}

async function updateTeamDetails (ctx) {
	const { id, name, members } = ctx;
	const team = await Team.findById(id);
	team.name = name;
	team.members = members;
	return await team.save();
}

async function updateTeamStatus (ctx) {
	const { _id, status } = ctx;
	const team = await Team.findById(_id);
	team.status = status;
	if (status === 'riddle-timeout') {
		team.timeout = new Date(Date.now() + 120 * 1000);
		setTimeout(async () => {
			team.status = 'riddle-question';
			team.timeout = null;
			await team.save();
		}, 120 * 1000);
	} else if (status === 'location-code') {
		team.questionsAttempted = ctx.questionNo;
	}
	return await team.save();
}

async function getTeamFromSessionID (sessionId) {
	const session = await TeamSession.findById(sessionId);
	const team = await Team.findById(session.teamId);
	if (!team) throw new Error('Team Not Found');
	else return team;
}

async function createTeamSession (teamId) {
	// 3327: You Are My Special
	const sessionId = [3, 3, 2, 7].map(i => (Math.random() + 1).toString(36).substring(2, 2 + i)).join('-');
	const session = new TeamSession({
		_id: sessionId,
		teamId: teamId
	});
	await session.save();
	return sessionId;
}

async function removeTeamSession (sessionId) {
	// Use this if we want to remove sessions after logout
	await Session.findByIdAndDelete(sessionId);
}


module.exports = {
	createUser,
	editUser,
	updateImage,
	getUsers,
	genUserMap,
	getUserByUsername,
	validateUser,
	getUserFromSessionID,
	createSession,
	// createDummySession,
	removeSession,
	removeUser,
	getLiveQuiz,
	getLiveRecord,
	getAllLiveRecords,
	addLiveRecord,
	addLiveResult,
	updateLiveResult,
	getLiveResults,
	getLocations,
	getTeams,
	getTeamById,
	validateTeam,
	updateTeamDetails,
	updateTeamStatus,
	getTeamFromSessionID,
	createTeamSession,
	removeTeamSession
};
