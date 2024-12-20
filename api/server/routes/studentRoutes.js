const express = require('express');
const StudentController = require('../controllers/StudentController');
const router = express.Router();

router.get('/:id/courses', StudentController.fetchStudentCourses);

module.exports = router;
