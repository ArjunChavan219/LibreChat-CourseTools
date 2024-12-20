const Invite = require('../../models/Invite');
const Course = require('../../models/Course');
const Student = require('../../models/Student');

exports.acceptInvite = async (req, res) => {
    try {
        const { token } = req.params;
        const { studentId } = req.body; // Assume the student is logged in and we get their ID

        // Validate the token
        const invite = await Invite.findOne({ token });
        if (!invite) {
            return res.status(404).json({ message: 'Invalid or expired invite link' });
        }

        const course = await Course.findOne({ id: invite.courseId });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const student = await Student.findOne({ id: studentId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Add the student to the course if not already enrolled
        if (!course.students.includes(studentId)) {
            course.students.push(studentId);
            student.courses.push(invite.courseId);
            await course.save();
            await student.save();
        }

        res.status(200).json({ message: 'Successfully joined the course' });
    } catch (error) {
        res.status(500).json({ message: 'Error processing invite link', error });
    }
};
