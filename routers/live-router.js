const router = require('express').Router();

const handlerContext = {};

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
