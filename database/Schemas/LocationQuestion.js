const mongoose = require('mongoose');

const locationQuestionSchema = new mongoose.Schema({
	_id: { type: String, required: true },
	question: { type: String, required: true },
	answer: { type: String, required: true },
	locationCode: { type: String, required: true }
}, { collection: 'location-questions' });

module.exports = mongoose.model('LocationQuestion', locationQuestionSchema);
