const router = require('express').Router();
const dbh = require('../database/handler');
const { body, validationResult } = require('express-validator');
const checker = require('../src/checker.js');

const handlerContext = {};

router.use((req, res, next) => {
	if (!req.loggedIn) return req.method === 'GET' ? res.redirect('/login') : res.status(403).send('Forbidden. Not logged in.');
	return next();
});

const teams = [
	{
		id: 1,
		name: 'Team 1',
		members: [
			{ name: 'User 1', email: 'user4@example.com', phone: '123-456-7890' },
			{ name: 'User 2', email: 'user5@example.com', phone: '987-654-3210' },
			{ name: 'User 3', email: 'user6@example.com', phone: '555-555-5555' }
		]
	},
	{
		id: 2,
		name: 'Team 2',
		members: [
			{ name: 'User 4', email: 'user4@example.com', phone: '123-456-7890' },
			{ name: 'User 5', email: 'user5@example.com', phone: '987-654-3210' },
			{ name: 'User 6', email: 'user6@example.com', phone: '555-555-5555' }
		]
	},
	{
		id: 3,
		name: 'Team 3',
		members: [
			{ name: 'User 7', email: 'user7@example.com', phone: '111-222-3333' },
			{ name: 'User 8', email: 'user8@example.com', phone: '444-555-6666' },
			{ name: 'User 9', email: 'user9@example.com', phone: '777-888-9999' }
		]
	}
];

const team = {
	id: 1,
	name: 'Team 1'
};

const locationQuestion = {
	id: 1,
	question: 'Where is the best waifu',
	answer: 'Oregairu'
};

const riddleQuestion = {
	id: 1,
	question: 'Who is the best waifu',
	answer: 'Shizuka Hiratsuka'
};

const locationCode = 'ABC123';

router.get('/', async (req, res) => {
	if (req.isAdmin) {
		return res.renderFile('admin/team-list.njk', {
			teams
		});
	} else {
		// if (!handlerContext.quizStarted) return res.redirect('/');
		return res.renderFile('live/interface.njk', {
			team,
			locationQuestion
		});
		// return res.renderFile('live/interface.njk');
	}
});

router.patch('/location-code', async (req, res) => {
	const teamID = parseInt(req.body.id);
	const location = req.body.locationcode;
	// console.log(teamID);
	// console.log(location);
	// FIND TEAM BY ID IN LOCAL STORAGE
	// MARK TEAM AS COMPLETED FOR LOCATION BY FINDING TEAM BY ID AND ADDING LOCATION TO COMPLETED LOCATIONS LIST
	if (location === locationCode) {
		return res.send('correct');
	} else {
		return res.status(400).send('incorrect location');
	}
});

router.patch('/location-submit-answer', async (req, res) => {
	const teamID = parseInt(req.body.id);
	const questionID = parseInt(req.body.question);
	const answer = req.body.locationanswer;
	const location = req.body.locationcode;

	// console.log(teamID);
	// console.log(questionID);
	// console.log(answer);
	// console.log(location);

	// FIND QUESTION WITH ID IN LOCAL STORAGE
	const question = locationQuestion;
	if (question.answer === answer) {
	// MARK QUESTION AS COMPLETED FOR TEAM BY FINDING TEAM BY ID AND ADDING QUESTION TO COMPLETED QUESTIONS LIST
		return res.send('correct');
	} else {
		return res.status(400).send('incorrect answer');
	}
});

router.patch('/riddle-submit-answer', async (req, res) => {
	const teamID = parseInt(req.body.id);
	const questionID = parseInt(req.body.question);
	const answer = req.body.riddleanswer;

	// console.log(teamID);
	// console.log(questionID);
	// console.log(answer);

	// FIND QUESTION WITH ID IN LOCAL STORAGE
	const question = riddleQuestion;
	if (question.answer === answer) {
	// MARK QUESTION AS COMPLETED FOR TEAM BY FINDING TEAM BY ID AND ADDING QUESTION TO COMPLETED QUESTIONS LIST
		return res.send('correct');
	} else {
		return res.status(400).send('incorrect answer');
	}
});

router.get('/results', async (req, res) => {
	if (req.isAdmin) {
		const results = await dbh.getLiveResults(handlerContext.quizId);
		const userMap = await dbh.genUserMap();
		handlerContext.results = results;
		handlerContext.userMap = userMap;
	}
	return res.renderFile('live/results.njk', {
		results: handlerContext.results,
		userMap: handlerContext.userMap,
		admin: req.isAdmin
	});
});

router.post('/start-quiz', (req, res) => {
	if (!req.isAdmin) return res.status(403).send('Forbidden: Admin permissions not detected.');
	handlerContext.quizStarted = true;
	io.sockets.in('waiting-for-live-quiz').emit('start', true);
	return res.send('quiz-started');
});

router.post('/start-q', (req, res) => {
	if (!req.isAdmin) return res.status(403).send('Forbidden: Admin permissions not detected.');
	handlerContext.responseCache = {};
	const qNum = req.body.questionNumber;
	const currentQ = handlerContext.quiz.questions[qNum].question;
	const options = handlerContext.quiz.questions[qNum].options;
	const type = handlerContext.quiz.questions[qNum].type;
	handlerContext.qNum = qNum;
	io.sockets.in('waiting-for-live-quiz').emit('question', { qNum, type, options });
	handlerContext.LQnum = qNum;
	setTimeout(() => {
		const solution = handlerContext.quiz.questions[qNum].solution;
		io.sockets.in('waiting-for-live-quiz').emit('answer');
		setTimeout(() => {
			Object.entries(handlerContext.responseCache).map(async ([userId, answer] = response) => {
				await dbh.addLiveRecord(userId, handlerContext.quiz._id, handlerContext.qNum, answer);
				const points = checker.checkLive(answer, type, solution);
				if (points) return await dbh.updateLiveResult(userId, handlerContext.quiz._id, points);
			});
		}, 2000);
	}, type === 'mcq' ? 12000 : 22000);
	return res.send('question-live');
});

router.post('/submit', async (req, res) => {
	if (req.isAdmin) return res.send('admins are not allowed here ;-;');
	if (handlerContext.responseCache[req.user._id]) return res.send('Forbidden: Already Submitted');
	const answer = req.body.submitted;
	handlerContext.responseCache[req.user._id] = answer;
	return res.send('submitted');
});

router.post('/end-quiz', (req, res) => {
	if (!req.isAdmin) return res.status(403).send('Forbidden: Admin permissions not detected.');
	io.sockets.in('waiting-for-live-quiz').emit('end', true);
	handlerContext.quiz = {};
	return res.send('quiz-ended');
});

router.post('/recheck', async (req, res) => {
	if (!req.isAdmin) return res.status(403).send('Forbidden: Admin permissions not detected.');
	const records = await dbh.getAllLiveRecords(handlerContext.quizId);
	const quiz = await dbh.getLiveQuiz(handlerContext.quizTitle);
	const userData = {};
	records.forEach(record => {
		if (!record.response) return;
		const points = checker.checkLive(
			record.response,
			quiz.questions[record.questionNo].type,
			quiz.questions[record.questionNo].solution
		);
		if (points > 0) {
			if (!userData[record.userId]) userData[record.userId] = points;
			else userData[record.userId] = userData[record.userId] + points;
		}
	});
	Object.entries(userData).map(async ([userId, points] = user) => {
		await dbh.addLiveResult(userId, quiz._id, points);
	});
	return res.send('rechecked');
});

module.exports = {
	route: '/live',
	router
};
