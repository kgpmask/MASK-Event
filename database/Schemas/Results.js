const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
	userId: { type: String, required: true },
	quizId: { type: String, required: true },
	points: { type: Number, required: true, default: 0 }
}, { collection: 'live-results' });

module.exports = mongoose.model('Results', resultSchema);
