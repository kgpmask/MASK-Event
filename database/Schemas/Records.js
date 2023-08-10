const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
	userId: { type: String, required: true },
	quizId: { type: String, required: true },
	questionNo: { type: Number, required: true },
	response: String
}, { collection: 'live-records' });

module.exports = mongoose.model('Records', recordSchema);
