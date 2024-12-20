const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    description: { type: String },
    professor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor', required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    tas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
});


module.exports = mongoose.model('Course', courseSchema);
