const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	_id: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	roll: { type: String, required: true },
	phone: { type: Number, required: true },
	email: { type: String, required: true },
	username: { type: String, required: true },
	password: { type: String, required: true },
	image: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);