const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    courses: [{ type: String }],
    taCourses: [{ type: String }],
    role: { type: String, enum: ['Student', 'TA'], default: 'Student' },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

studentSchema.virtual('courseDetails', {
    ref: 'Course',
    localField: 'courses',
    foreignField: 'id',
});

studentSchema.virtual('taCourseDetails', {
    ref: 'Course',
    localField: 'taCourses',
    foreignField: 'id',
});

module.exports = mongoose.model('Student', studentSchema);
