const router = require('express').Router();
const dbh = require('../database/handler');

const handlerContext = {};

router.get('/master', async (req, res) => {
	// TODO: In the future, set a 'daily' script to run at midnight and update a process.env.LIVE_QUIZ parameter
	handlerContext.quiz = await dbh.getLiveQuiz('SQ1');
	// if (!quiz) return res.renderFile('events/quizzes_404.njk', { message: `The quiz hasn't started, yet!` });
	const questions = handlerContext.quiz.questions;
	return res.renderFile('live/master.njk', {
		quiz: questions,
		qAmt: questions.length,
		id: 'live'
	});
});

router.post('/startQ', (req, res) => {
	const qNum = req.body.questionNumber;
	const currentQ = handlerContext.quiz.questions[qNum].question;
	const options = handlerContext.quiz.questions[qNum].options;
	io.sockets.in('waiting-for-live-quiz').emit('question', { currentQ, options });
	handlerContext.LQnum = qNum;
	res.send('question-live');
});

router.post('/start-quiz', (req, res) => {
	const quizId = req.body.id;
	io.sockets.in('waiting-for-live-quiz').emit('start', true);
	res.send('quiz-started');
});

router.post('/end-quiz', (req, res) => {
	io.sockets.in('waiting-for-live-quiz').emit('end', true);
	res.send('quiz-ended');
});

router.get('/', async (req, res) => {
	if (req.isAdmin) {
		const quiz = await dbh.getLiveQuiz();
		// if (!quiz) return res.renderFile('events/quizzes_404.njk', { message: `The quiz hasn't started, yet!` });
		const questions = quiz.questions;
		return res.renderFile('events/live_master.njk', {
			quiz: JSON.stringify(questions),
			qAmt: questions.length,
			id: 'live',
			dev: PARAMS.dev
		});
	} else {
		if (!Object.keys(handlerContext).length) return res.renderFile('live/landing.njk');
		return res.renderFile('live/participant.njk');
	}
});

router.post('/submit', (req, res) => {
	if (req.isAdmin) return res.send('admins are not allowed here ;-;');
	const answer = req.body.submitted;
});


module.exports = {
	route: '/live',
	router
};
