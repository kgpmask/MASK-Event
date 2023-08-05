const router = require('express').Router();

// app.get('/master', async (req, res) => {
// 	if (PARAMS.dev) {
// 		// TODO: In the future, set a 'daily' script to run at midnight and update a process.env.LIVE_QUIZ parameter
// 		const quiz = await dbh.getLiveQuiz();
// 		// if (!quiz) return res.renderFile('events/quizzes_404.njk', { message: `The quiz hasn't started, yet!` });
// 		const questions = quiz.questions;
// 		return res.renderFile('events/live_master.njk', {
// 			quiz: JSON.stringify(questions),
// 			qAmt: questions.length,
// 			id: 'live',
// 			dev: PARAMS.dev
// 		});
// 	} else {
// 		return res.renderFile('events/quizzes_404.njk', { message: `STOP SNOOPING AROUND!` });
// 	}
// });

// router.get('/', (req, res) => {
// 	// if (req.user.isAdmin) return res.renderFile('live/master.njk');
// 	res.renderFile('live/participant.njk');
// });

router.get('/', async (req, res) => {
	if (req.user.isAdmin) {
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
	if (req.user.isAdmin) return res.send('admins are not allowed here ;-;');
	const answer = req.body.submitted;
});

router.post('/start', (req, res) => {

});

module.exports = {
	route: '/live',
	router
};
