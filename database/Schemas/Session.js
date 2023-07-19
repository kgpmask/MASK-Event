const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
	_id: { type: String, required: true },
	userID: { type: Number, required: true },
	timestamp: { type: Date, default: new Date() }
}, { collection: 'event-session' });

module.exports = mongoose.model('Session', sessionSchema);
