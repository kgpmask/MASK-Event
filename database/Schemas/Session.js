const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
	_id: { type: String, required: true, unique: true },
	sessionID: { type: Number, required: true, unique: true }
});

module.exports = mongoose.model('Session', sessionSchema);
