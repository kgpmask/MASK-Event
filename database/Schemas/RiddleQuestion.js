const mongoose = require('mongoose');

const riddleQuestionSchema = new mongoose.Schema({
	_id: { type: String, required: true },
	question: { type: String, required: true },
	answer: { type: String, required: true }
}, { collection: 'riddle-questions' });

module.exports = mongoose.model('RiddleQuestion', riddleQuestionSchema);
