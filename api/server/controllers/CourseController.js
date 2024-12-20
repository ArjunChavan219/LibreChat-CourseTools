require('dotenv').config();

const crypto = require('crypto');
const Invite = require('../../models/Invite');
const Course = require('../../models/Course');
const Student = require('../../models/Student');
const { User } = require('../../models');
const { model } = require('mongoose');

const adminToken = process.env.ADMIN_TOKEN;

// Get roster (students and TAs)
exports.getRoster = async (req, res) => {
    try {
        const courseId = req.params.id;
        
        const course = await Course.findOne({ id: courseId })
            .populate({
                path: 'students',
                populate: {
                    path: 'userId',
                    model: 'User',
                    select: 'name email',
                },
                select: 'role',
            })
            .populate({
                path: 'tas',
                populate: {
                    path: 'userId',
                    model: 'User',
                    select: 'name email',
                },
                select: 'role',
            })
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        

        res.json({
            students: course.students.map(student => {                
                return {
                    id: student._id,
                    role: student.role,
                    name: student.userId.name,
                    email: student.userId.email,
                    userId: student.userId._id,
                }
            }),
            tas: course.tas.map(student => {
                return {
                    id: student._id,
                    role: student.role,
                    name: student.userId.name,
                    email: student.userId.email,
                    userId: student.userId._id,
                }
            }),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching roster', error });
    }
};

// Get list of students not in the course
exports.getNewStudents = async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findOne({ id: courseId });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const enrolledStudents = [...course.students, ...course.tas];
        const unassignedStudents = await Student.find({ _id: { $nin: enrolledStudents } });
        const unassignedStudentsData = await Promise.all(unassignedStudents.map(async (student) => {
            const studentData = await User.findOne({ profileId: student._id })
            
            return {
                id: student._id,
                name: studentData.name,
                email: studentData.email
            }
        }));
        
        res.status(200).json(unassignedStudentsData);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching roster', error });
    }
};

// Add a student to the course
exports.addStudentToCourse = async (req, res) => {
    try {
        const { isTA } = req.body;
        const courseId = req.params.id;
        const studentId = req.params.studentId;

        // Find the course
        const course = await Course.findOne({ id: courseId });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Find the student
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (isTA) {
            // Add student as TA to the course and student's taCourses
            if (!course.tas.includes(studentId)) {
                course.tas.push(studentId);
                student.taCourses.push(courseId);

                const user = await User.findOne({ profileId: student._id});
                if (student.role != 'TA') {
                    student.role = 'TA';
                    user.profileRole = 'TA';
                    await user.save();
                }
            }
        } else {
            // Add student to the course and student's courses
            if (!course.students.includes(studentId)) {
                course.students.push(studentId);
                student.courses.push(courseId);
            }
        }

        // Save updates
        await course.save();
        await student.save();

        res.status(200).json({ message: 'Student added to course successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding student to course', error });
    }
};

// Update a student role in the course
exports.updateStudentRole = async (req, res) => {
    try {
        const { newRole } = req.body;
        const courseId = req.params.id;
        const studentId = req.params.studentId;

        const course = await Course.findOne({ id: courseId });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        const user = await User.findOne({ profileId: student._id});

        course.students = course.students.filter((id) => id != studentId);
        course.tas = course.tas.filter((id) => id != studentId);
        student.courses = student.courses.filter((id) => id !== courseId);
        student.taCourses = student.taCourses.filter((id) => id !== courseId);

        if (newRole === 'TA') {
            course.tas.push(studentId);
            student.taCourses.push(courseId);
            student.role = 'TA';
            user.profileRole = 'TA';
        } else {
            course.students.push(studentId);
            student.courses.push(courseId);

            if (student.taCourses.length === 0) {
                student.role = 'Student';
                user.profileRole = 'Student';
            }
        }

        await course.save();
        await student.save();
        await user.save();

        res.status(200).json({ message: 'Student role updated successfully', student });

    } catch (error) {
        res.status(500).json({ message: 'Error adding student to course', error });
    }
};

// Remove a student from the course
exports.removeStudentFromCourse = async (req, res) => {
    try {
        const { isTA } = req.body;
        const courseId = req.params.id;
        const studentId = req.params.studentId;

        // Find the course
        const course = await Course.findOne({ id: courseId });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Find the student
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }        
        
        if (isTA) {
            course.tas = course.tas.filter((taId) => taId != studentId);
            student.taCourses = student.taCourses.filter((taCourseId) => taCourseId != courseId);

            // Check if the student is no longer a TA for any course
            if (student.taCourses.length === 0) {
                student.role = 'Student';
            }
        } else {
            // Remove student from the course and student's courses
            course.students = course.students.filter((studentIdInCourse) => studentIdInCourse != studentId);
            student.courses = student.courses.filter((courseIdForStudent) => courseIdForStudent != courseId);
        }

        // Save updates
        await course.save();
        await student.save();

        res.status(200).json({ message: 'Student removed from course successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing student from course', error });
    }
};

// Generate Link
exports.generateLink = async (req, res) => {
    try {
        const courseId = req.params.id;
        const token = crypto.randomBytes(16).toString('hex');
        
        const invite = new Invite({ token, courseId });
        await invite.save();

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error generating invite link', error });
    }
};

// Check Token Validity
exports.checkToken = async (req, res) => {
    try {
        const { token } = req.query;
        if (token === adminToken) {
            res.status(200).json({ message: 'Token is valid', courseId: "" });
        }
        
        const invite = await Invite.findOne({ token: token });

        if (!invite) {
            return res.status(404).json({ message: 'Token not valid or expired' });
        }        
        res.status(200).json({ message: 'Token is valid', courseId: invite.courseId });
    } catch (error) {
        res.status(500).json({ message: 'Error checking token', error });
    }
};

