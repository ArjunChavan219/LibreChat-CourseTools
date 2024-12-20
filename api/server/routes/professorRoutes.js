const express = require('express');
const ProfessorController = require('../controllers/ProfessorController');
const router = express.Router();

router.get('/:id/courses', ProfessorController.getCoursesForProfessor); // Get all courses for a professor
router.post('/:id/courses', ProfessorController.addCourseForProfessor); // Add a course for a professor
router.get('/:id', ProfessorController.getProfessorDetails); // Get professor details
router.delete('/:id', ProfessorController.deleteProfessor); // Delete professor and their courses

module.exports = router;
