const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    icon: { type: String, default: '⭐' },
    streak: { type: Number, default: 0 },
    xpValue: { type: Number, default: 20 },
    completed: { type: Boolean, default: false },
    completedDates: [{ type: String }], // Array of YYYY-MM-DD strings
    time: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Habit', habitSchema);
