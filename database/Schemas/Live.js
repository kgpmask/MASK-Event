const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
	_id: { type: String, required: true },
	title: {
		type: String, required: true, default: () => {
			return new Date().toISOString().slice(0, 10);
		},
		unique: true
	},
	questions: {
		type: [
			{
				question: {
					type: {
						title: { type: String, required: true },
						body: { type: String, required: true }
					},
					required: true
				},
				type: { type: String, required: true, enum: ['text', 'mcq', 'number'] },
				options: [{ type: String, required: true }],
				solutions: {
					type: [String, [{ type: [String] }]],
					required: true
				}
			}
		],
		required: true
	}
}, { collection: 'live-questions' });

const recordSchema = new mongoose.Schema({
	userId: { type: String, required: true },
	quizId: { type: String, required: true },
	questionNo: { type: Number, required: true },
	response: String
}, { collection: 'live-records' });

module.exports = {
	LiveQuestions: mongoose.model('Questions', questionSchema),
	LiveRecords: mongoose.model('Records', recordSchema)
};
