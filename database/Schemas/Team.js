const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
	_id: { type: Number, required: true },
	name: { type: String, required: true },
	password: { type: String, requred: true },
	members: [
		{
			name: { type: String, required: true },
			email: { type: String, required: true },
			phone: { type: String, required: true }
		}
	],
	status: { type: String, required: true },
	questionsAttempted: { type: Number, required: true, default: 0 },
	order: [
		{
			location: {
				type: Number,
				required: true
			},
			question: {
				type: Number,
				required: true
			}
		}
	]
}, { collection: 'event-teams' });

module.exports = mongoose.model('Team', teamSchema);
