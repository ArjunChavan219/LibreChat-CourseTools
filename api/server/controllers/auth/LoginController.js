const { setAuthTokens } = require('~/server/services/AuthService');
const { logger } = require('~/config');
const Invite = require('../../../models/Invite');
const Course = require('../../../models/Course');
const Student = require('../../../models/Student');

const loginController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const { password: _, __v, ...user } = req.user;
    user.id = user._id.toString();

    const token = await setAuthTokens(req.user._id, res);
    const courseToken = req.body.courseToken;
      if (courseToken) {
      const invite = await Invite.findOne({ token: courseToken });

      if (!invite) {
          return res.status(404).json({ message: 'Token not valid or expired' });
      }
      const course = await Course.findOne({ id: invite.courseId });
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      const student = await Student.findOne({ userId: user._id });
      if (!student.courses.includes(course.id)) {
        student.courses.push(course.id);
        course.students.push(student._id);
        
        await student.save();
        await course.save();
      }
    }
    
    return res.status(200).send({ token, user });
  } catch (err) {
    logger.error('[loginController]', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = {
  loginController,
};
