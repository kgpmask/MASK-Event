const router = require('express').Router();
const dbh = require('../database/handler');

const checker = require('../src/checker.js');

const handlerContext = {};

router.use((req, res, next) => {
	if (!req.loggedIn) return req.method === 'GET' ? res.redirect('/login') : res.status(403).send('Forbidden. Not logged in.');
	return next();
});

router.get('/', async (req, res) => {
	if (req.isAdmin) {
		handlerContext.quiz = await dbh.getLiveQuiz(PARAMS.dev ? 'SQ4' : undefined);
		handlerContext.quizTitle = handlerContext.quiz.title;
		const questions = handlerContext.quiz.questions;
		return res.renderFile('live/master.njk', {
			questions,
			qAmt: questions.length,
			id: 'live'
		});
	} else {
		if (!handlerContext.quizStarted) return res.renderFile('live/landing.njk');
		return res.renderFile('live/participant.njk');
	}
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
		Object.entries(handlerContext.responseCache).map(async ([userId, answer] = response) => {
			await dbh.addLiveRecord(userId, handlerContext.quiz.title, handlerContext.qNum, answer);
			const points = checker.checkLive(answer, type, solution);
			if (points) return await dbh.updateLiveResult(userId, points);
		});
	}, type === 'mcq' ? 12000 : 17000);
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

router.get('/recheck', async (req, res) => {
	if (!req.isAdmin) return res.status(403).send('Forbidden: Admin permissions not detected.');
	const records = await dbh.getAllLiveRecords(handlerContext.quizTitle);
	const quiz = await dbh.getLiveQuiz(handlerContext.quizTitle);
	const userData = {};
	records.forEach(record => {
		if (!record.response) return;
		const points = checker.checkLive(
			record.response,
			quiz.questions[record.questionNo].type,
			quiz.questions[record.questionNo].solution
		);
		if (points) {
			if (userData[record.userId]) userData[record.userId] = points;
			else userData[record.userId] = userData[record.userId] + points;
		}
	});
	Object.entries(userData).map(async ([userId, points] = user) => {
		await dbh.addLiveResult(userId, points);
	});
});

module.exports = {
	route: '/live',
	router
};
