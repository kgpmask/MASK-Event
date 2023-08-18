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
		const questions = handlerContext.quiz.questions;
		return res.renderFile('live/master.njk', {
			questions,
			qAmt: questions.length,
			id: 'live'
		});
	} else {
		// if (!Object.keys(handlerContext).length) return res.renderFile('live/landing.njk');
		return res.renderFile('live/participant.njk');
	}
});

router.post('/start-quiz', (req, res) => {
	if (!req.isAdmin) return res.status(403).send('Forbidden: Admin permissions not detected.');
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
		io.sockets.in('waiting-for-live-quiz').emit('answer');
		Object.entries(handlerContext.responseCache).map(async ([userId, answer] = response) => {
			await dbh.addLiveRecord(userId, quizID, handlerContext.qNum, answer);
			const points = checker.checkLive(answer, type, solution);
			if (points) return await dbh.updateLiveResult(userId, points);
		});
		check.check(handlerContext.responseCache, type, handlerContext.quiz.questions[qNum].solution);
	}, 23000);
	return res.send('question-live');
});

router.post('/start-quiz', (req, res) => {
	if (req.user.isAdmin) {
		io.sockets.in('waiting-for-live-quiz').emit('start', true);
		return res.send('quiz-started');
	} else {
		return res.send('not admin');
	}
});

router.post('/end-quiz', (req, res) => {
	if (req.user.isAdmin) {
		io.sockets.in('waiting-for-live-quiz').emit('end', true);
		return res.send('quiz-ended');
	} else {
		return res.send('not admin');
	}
});

router.get('/', async (req, res) => {
	if (!req.user) return res.send('not logged in');
	if (req.isAdmin) {
		handlerContext.quiz = await dbh.getLiveQuiz(quizID);
		// if (!quiz) return res.renderFile('events/quizzes_404.njk', { message: `The quiz hasn't started, yet!` });
		const questions = handlerContext.quiz.questions;
		return res.renderFile('live/master.njk', {
			questions,
			qAmt: questions.length,
			id: 'live'
		});
	} else {
		if (!Object.keys(handlerContext).length) return res.renderFile('info/landing.njk');
		return res.renderFile('live/participant.njk');
	}
});

});

router.post('/submit', async (req, res) => {
	if (req.isAdmin) return res.send('admins are not allowed here ;-;');
	if (handlerContext.responseCache[req.user._id]) return res.send('Forbidden: Already Submitted');
	const answer = req.body.submitted;
	handlerContext.responseCache[req.user._id] = answer;
	return res.send('submitted');
});

router.post('/end-quiz', (req, res) => {
	if (req.isAdmin) return res.send('admins are not allowed here ;-;');
	io.sockets.in('waiting-for-live-quiz').emit('end', true);
	return res.send('quiz-ended');
});

router.get('/recheck', async (req, res) => {
	if (!req.isAdmin) return res.send('Forbidden: User does not have the permission');
	const records = await dbh.getAllLiveRecords(quizID);
	const quiz = await dbh.getLiveQuiz(quizID);
});



module.exports = {
	route: '/live',
	router
};
