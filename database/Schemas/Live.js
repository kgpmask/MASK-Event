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
				question: {
					type: [
						{
							val: { type: String, required: true },
							type: { type: String, enum: ['text', 'image', 'video', 'mp3'], required: true }
						}
					],
					required: true
				},
				points: Number,
				options: {
					type: {
						type: String,
						required: true,
						enum: ['text', 'mcq', 'number']
					},
					value: [
						{
							val: { type: String, required: true },
							type: { type: String, enum: ['text', 'image'], required: true }
						}
					]
				},
				solutions: {
					type: [String, Number, [{ type: [String, Number] }]],
					required: true
				}
			}
		],
		required: true
	}
});
