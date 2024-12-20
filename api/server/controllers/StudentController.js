const { User } = require('../../models');
const Student = require('../../models/Student');

// Get all courses for a student
exports.fetchStudentCourses = async (req, res) => {    
    try {
        const studentId = req.params.id;
        const studentData = await User.findById(studentId);
        
        const student = await Student.findById(studentData.profileId)
            .populate({
                path: 'courseDetails',
                populate: {
                    path: 'professor',
                    model: 'Professor',
                    populate: ({
                        path: 'userId',
                        model: 'User',
                        select: 'name email'
                    }),
                    select: 'userId',
                },
                select: 'name description professor',
            })
            .populate({
                path: 'taCourseDetails',
                populate: {
                    path: 'professor',
                    model: 'Professor',
                    populate: ({
                        path: 'userId',
                        model: 'User',
                        select: 'name email'
                    }),
                    select: 'userId',
                },
                select: 'name description professor',
            });
        
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        res.status(200).json({
            studentCourses: student.courseDetails,
            taCourses: student.taCourseDetails,
        });
    } catch (error) {
        console.error(error);
        
        res.status(500).json({ message: 'Error fetching courses', error });
    }
};
