const mongoose = require('mongoose');

const professorSchema = new mongoose.Schema({
    courses: [{ type: String }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

professorSchema.virtual('courseDetails', {
    ref: 'Course',
    localField: 'courses',
    foreignField: 'id',
});

module.exports = mongoose.model('Professor', professorSchema);
