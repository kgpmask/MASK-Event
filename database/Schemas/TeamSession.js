const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
	_id: { type: String, required: true },
	teamId: { type: Number, required: true },
	timestamp: { type: Date, default: new Date() }
}, { collection: 'team-session' });

module.exports = mongoose.model('TeamSession', sessionSchema);
