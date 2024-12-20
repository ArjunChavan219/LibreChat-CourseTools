const Professor = require('../../models/Professor');
const Course = require('../../models/Course');
const { User } = require('../../models');

// Get all courses for a professor
exports.getCoursesForProfessor = async (req, res) => {
    try {
        const professorData = await User.findById(req.params.id);
        const professorId = await Professor.findById(professorData.profileId)

        const courses = await Course.find({ professor: professorId });
        if (!courses.length) {
            return res.status(200).json({ message: 'No courses found for this professor' });
        }

        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses', error });
    }
};

// Add a new course for a professor
exports.addCourseForProfessor = async (req, res) => {
    try {
        const professorData = await User.findById(req.params.id);
        const professor = await Professor.findById(professorData.profileId)
        const { name, description, id } = req.body;
        
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        // Create a new course
        const newCourse = new Course({
            id,
            name,
            description,
            professor: professor._id,
            students: [],
            tas: []
        });
        professor.courses.push(id)

        await newCourse.save();
        await professor.save();

        res.status(201).json(newCourse);
    } catch (error) {
        console.error(error);
        
        res.status(500).json({ message: 'Error adding course', error });
    }
};

// Get a professor's details
exports.getProfessorDetails = async (req, res) => {
    try {
        const professorId = req.params.id;

        // Fetch professor details
        const professor = await Professor.findOne({ id: professorId }).populate('courseDetails');
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        res.status(200).json(professor);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching professor details', error });
    }
};

// Delete a professor (and optionally cascade delete their courses)
exports.deleteProfessor = async (req, res) => {
    try {
        const professorId = req.params.id;

        // Find and delete professor
        const professor = await Professor.findOneAndDelete({ id: professorId });
        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        // Optional: Cascade delete their courses
        await Course.deleteMany({ professor: professorId });

        res.status(200).json({ message: 'Professor and their courses deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting professor', error });
    }
};
