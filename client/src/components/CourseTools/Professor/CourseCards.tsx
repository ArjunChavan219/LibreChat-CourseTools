import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '~/hooks';
import Modal from '../Shared/Modal';
import './CourseCards.css';

import type t from 'librechat-data-provider';
import { useCoursesByProfessor, useAddCourse } from 'librechat-data-provider/react-query';

interface CourseCardsProps {
    isNav: boolean;
  }

const CourseCards: React.FC<CourseCardsProps> = ({ isNav }) => {
    const { user, setCourseId, setStudentId, setStudentName } = useAuthContext();
    const [courses, setCourses] = useState<t.TCourse[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [courseName, setCourseName] = useState('');
    const [courseDescription, setCourseDescription] = useState('');
    const [courseTempId, setCourseTempId] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { isLoading, error } = useCoursesByProfessor(user?.id, setCourses);

    useEffect(() => {
        setStudentId(undefined);
        setStudentName(undefined);
    }, []);

    const navigate = useNavigate();

    const classPrefix = isNav ? "nav" : "prof";

    const { mutate: addNewCourse } = useAddCourse(user?.id, (newCourse) => {
        setCourses(prev => [...prev, newCourse]);
        resetForm();
    }, (error) => {
        console.error('Error adding course:', error);
        setErrorMessage(error.message);
    });

    const handleAddCourse = () => {
        if (!courseName.trim()) {
            setErrorMessage('Course name is required.');
            return;
        }
        
        addNewCourse({
            name: courseName,
            description: courseDescription,
            id: courseTempId
        });
    };

    const resetForm = () => {
        setCourseName('');
        setCourseDescription('');
        setCourseTempId('');
        setIsModalOpen(false);
        setErrorMessage(null);
    };

    const handleCourseClick = (courseId: string) => {        
        navigate("/c/new", {replace: true})
        setCourseId(courseId);
    }

    if (isLoading) {
        return <div>Loading courses...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className={`${classPrefix}-dashboard-container`}>
            {!isNav && <button onClick={() => setIsModalOpen(true)} className="prof-add-btn">Add Course</button>}
            {courses.length > 0 ? (
                courses.map((course) => (
                    <div onClick={() => handleCourseClick(course.id)} className={`${classPrefix}-course-card`}>
                        <h3 className={`${classPrefix}-course-title`}>{course.name}</h3>
                        {!isNav && <p className="prof-course-desc">{course.description}</p>}
                    </div>
                ))) : (
                <p className={`${classPrefix}-empty-message`}>No courses available.</p>
            )}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                <div style={{width: "425px"}}>
                    <div className="modal-header">
                        <h2>Add Course</h2>
                    </div>
                    <div className="modal-body">
                        <label htmlFor="course-id" className="form-label">
                            Course ID:
                        </label>
                        <input
                            id="course-id"
                            type="text"
                            value={courseTempId}
                            onChange={(e) => setCourseTempId(e.target.value)}
                            placeholder="Enter course ID"
                            className="form-input"
                        />
                        <label htmlFor="course-name" className="form-label">
                            Course Name:
                        </label>
                        <input
                            id="course-name"
                            type="text"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            placeholder="Enter course name"
                            className="form-input"
                        />
                        <label htmlFor="course-description" className="form-label">
                            Description:
                        </label>
                        <textarea
                            id="course-description"
                            value={courseDescription}
                            onChange={(e) => setCourseDescription(e.target.value)}
                            placeholder="Enter course description"
                            className="form-textarea"
                        />
                    </div>
                    <div className="modal-footer">
                        <button onClick={handleAddCourse}>Save</button>
                        <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CourseCards;
