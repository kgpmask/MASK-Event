const router = require('express').Router();
const dbh = require('../database/handler');

const handlerContext = {};

router.post('/startQ', (req, res) => {
	if (req.user.isAdmin) {
		if (handlerContext.responseCache) handlerContext.responseCache = [];
		else handlerContext.responseCache = [];
		const qNum = req.body.questionNumber;
		const currentQ = handlerContext.quiz.questions[qNum].question;
		const options = handlerContext.quiz.questions[qNum].options;
		const type = handlerContext.quiz.questions[qNum].type;
		handlerContext.qNum = qNum;
		io.sockets.in('waiting-for-live-quiz').emit('question', { qNum, type, options });
		handlerContext.LQnum = qNum;
		setTimeout(() => {
			io.sockets.in('waiting-for-live-quiz').emit('answer');
		}, 23000);
		return res.send('question-live');
	} else {
		return res.send('not admin');
	}
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
		res.send('quiz-ended');
	} else {
		return res.send('not admin');
	}
});

router.get('/', async (req, res) => {
	if (!req.user) return res.send('not logged in');
	if (req.isAdmin) {
		handlerContext.quiz = await dbh.getLiveQuiz('SQ4');
		// if (!quiz) return res.renderFile('events/quizzes_404.njk', { message: `The quiz hasn't started, yet!` });
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

router.post('/submit', async (req, res) => {
	if (req.isAdmin) return res.send('admins are not allowed here ;-;');
	if (handlerContext.responseCache.includes(req.user._id)) return res.send('Forbidden: Already Submitted');
	const answer = req.body.submitted;
	const response = await dbh.addLiveResult(req.user._id, 'SQ4', req.body.qNum, answer);
	console.log(response);
	handlerContext.responseCache.push(req.user._id);
	return res.send('submitted');
});


module.exports = {
	route: '/live',
	router
};
