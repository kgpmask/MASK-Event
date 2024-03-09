const router = require('express').Router();
const dbh = require('../database/handler');
const { body, validationResult } = require('express-validator');
const checker = require('../src/checker.js');

const teams = require('../src/samples/teams.json');
// const locations = require('../src/samples/locations.json');

const handlerContext = {};

router.use((req, res, next) => {
	if (!req.loggedIn) return req.method === 'GET' ? res.redirect('/login') : res.status(403).send('Forbidden. Not logged in.');
	return next();
});

router.use((req, res, next) => {
	if (handlerContext.huntStarted || req.isAdmin) return next();
	return req.method === 'GET' ? res.redirect('/') : res.status(400).send('Hunt not started');
});

// const team = teams[1];

// const locationQuestion = {
// 	id: 1,
// 	question: 'Where is the best waifu',
// 	answer: 'Oregairu'
// };

// const riddleQuestion = riddleQuestions[0];

// const locationCode = 'ABC123';

router.get('/', async (req, res) => {
	if (req.isAdmin) {
		const teamList = await dbh.getTeams();
		return res.renderFile('admin/team-list.njk', {
			teams: teamList
		});
	} else {
		// if (!handlerContext.quizStarted) return res.redirect('/');
		return res.renderFile('live/interface.njk', {
			team: req.team,
			started: handlerContext.huntStarted
		});
		// return res.renderFile('live/interface.njk');
	}
});

router.post('/get-data', async (req, res) => {
	const teamID = req.body.teamID;
	if (teamID !== req.team._id) return res.status(500).send('WHy you hax');
	const locations = await dbh.getLocations();
	return res.status(200).send(JSON.stringify({
		team: req.team,
		locations: req.team.order.map((o) => locations.find((l) => l._id === o.location))
	}));
});

router.post('/get-attempted', (req, res) => {
	const teamID = req.body.teamID;
	if (teamID !== req.team._id) return res.status(500).send('WHy you hax');
	return res.status(200).send(req.team.questionsAttempted);
});
router.post('/get-state', (req, res) => {
	const teamID = req.body.teamID;
	if (teamID !== req.team._id) return res.status(500).send('WHy you hax');
	return res.status(200).send(req.team.status);
});
router.post('/get-timeout', async (req, res) => {
	if (req.team.status === 'riddle-timeout') {
		return res.status(200).send(req.team.timeout);
	}
	return res.status(400).send(false);
});

router.post('/update-status', async (req, res) => {
	await dbh.updateTeamStatus({ _id: req.team._id, status: req.body.status, questionNo: req.body.questionNo });
	return res.status(200).send('Updated Successfully');
});
router.post('/update-attempted', async (req, res) => {
	await dbh.updateTeamStatus({ _id: req.team._id, status: req.body.status, questionNo: req.body.questionNo });
	return res.status(200).send('Updated Successfully');
});

// router.patch('/location-code', async (req, res) => {
// 	const teamID = parseInt(req.body.id);
// 	const location = req.body.locationcode;
// 	// console.log(teamID);
// 	// console.log(location);
// 	// FIND TEAM BY ID IN LOCAL STORAGE
// 	// MARK TEAM AS COMPLETED FOR LOCATION BY FINDING TEAM BY ID AND ADDING LOCATION TO COMPLETED LOCATIONS LIST
// 	if (location === locationCode) {
// 		return res.send('correct');
// 	} else {
// 		return res.status(400).send('incorrect location');
// 	}
// });

router.post('/start-hunt', (req, res) => {
	if (!req.isAdmin) return res.status(403).send('Forbidden: Admin permissions not detected.');
	handlerContext.huntStarted = true;
	return res.send('Hunt Started');
});

router.post('/end-hunt', (req, res) => {
	if (!req.isAdmin) return res.status(403).send('Forbidden: Admin permissions not detected.');
	handlerContext.huntStarted = false;
	return res.send('Hunt Ended');
});

// ---------------------------------------------------------------------

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
