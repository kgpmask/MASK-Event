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
				solution: {
					type: [String, [{ type: [String] }]],
					required: true
				}
			}
		],
		required: true
	}
}, { collection: 'live-questions' });

module.exports = mongoose.model('Questions', questionSchema);
