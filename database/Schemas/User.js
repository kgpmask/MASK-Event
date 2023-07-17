const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	_id: { type: Number, required: true },
	name: { type: String, required: true },
	roll: { type: String, required: true },
	phone: { type: Number, required: true },
	email: { type: String, required: true },
	username: { type: String, required: true },
	salt: { type: String, required: true },
	hash: { type: String, required: true },
	image: String
}, { collection: 'event-users' });

module.exports = mongoose.model('User', userSchema);
