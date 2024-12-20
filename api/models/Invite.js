const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
    token: { type: String, unique: true, required: true },
    courseId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '7d' },
});

module.exports = mongoose.model('Invite', inviteSchema);
