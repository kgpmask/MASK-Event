const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
	_id: { type: String, required: true },
	name: { type: String, required: true },
	pointerQuestion: [{ type: String, required: true }],
	code: { type: String, required: true },
	questions: [
		{
			number: { type: Number, required: true },
			question: { type: String, required: true },
			answer: { type: Number, required: true }
		}
	],
	keywords: [{ type: String, required: true }]
}, { collection: 'locations' });

module.exports = mongoose.model('Location', locationSchema);
