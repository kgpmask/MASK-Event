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
				title: String,
				question: { type: String, required: true },
				points: Number,
				options: {
					type: {
						type: String,
						required: true,
						enum: ['text', 'mcq', 'number']
					},
					value: [{ type: String, required: true }]
				},
				solutions: {
					type: [String, Number, [{ type: [String, Number] }]],
					required: true
				}
			}
		],
		required: true
	}
}, { collection: 'live' });

module.exports = mongoose.model('Questions', questionSchema);
