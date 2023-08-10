const router = require('express').Router();
const dbh = require('../database/handler');

const handlerContext = {};

router.post('/startQ', (req, res) => {
	const qNum = req.body.questionNumber;
	const currentQ = handlerContext.quiz.questions[qNum].question;
	const options = handlerContext.quiz.questions[qNum].options;
	const type = handlerContext.quiz.questions[qNum].type;
	console.log(currentQ, options, type);
	io.sockets.in('waiting-for-live-quiz').emit('question', { currentQ, type, options });
	handlerContext.LQnum = qNum;
	res.send('question-live');
});

router.post('/start-quiz', (req, res) => {
	const quizId = req.body.id;
	io.sockets.in('waiting-for-live-quiz').emit('start', true);
	return res.send('quiz-started');
});

router.post('/end-quiz', (req, res) => {
	io.sockets.in('waiting-for-live-quiz').emit('end', true);
	res.send('quiz-ended');
});

router.get('/', async (req, res) => {
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
