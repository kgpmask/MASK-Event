const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
	userID: { type: Number, required: true },
	sessionID: { type: String, required: true, unique: true }
}, { collection: 'event-session' });

module.exports = mongoose.model('Session', sessionSchema);
