const express = require('express');
const CourseController = require('../controllers/CourseController');

const router = express.Router();

// Routes
router.get('/:id/students', CourseController.getRoster);
router.get('/:id/new-students', CourseController.getNewStudents);
router.post('/:id/students/:studentId', CourseController.addStudentToCourse);
router.delete('/:id/students/:studentId', CourseController.removeStudentFromCourse);
router.put('/:id/students/:studentId/role', CourseController.updateStudentRole);
router.put('/:id/students/:studentId/role', CourseController.updateStudentRole);
router.post('/:id/generate-link', CourseController.generateLink);
router.get('/check-token', CourseController.checkToken);

module.exports = router;
