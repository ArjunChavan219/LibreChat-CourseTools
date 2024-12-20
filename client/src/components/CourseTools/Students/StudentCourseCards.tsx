import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '~/hooks';
import './StudentCourseCards.css';
import { useFetchCourses } from 'librechat-data-provider/react-query';

interface Course {
    id: string;
    name: string;
    description: string;
    professor: {
        userId: {
            name: string;
            email: string;
            id: string;
        }
    }
}

interface StudentCourseCardsProps {
    isNav: boolean;
  }

const StudentCourseCards: React.FC<StudentCourseCardsProps> = ({ isNav }) => {
    const { user, setCourseId, setStudentId, setStudentName, setIsTACourse } = useAuthContext();
    const [studentCourses, setStudentCourses] = useState<Course[]>([]);
    const [taCourses, setTACourses] = useState<Course[]>([]);
    const navigate = useNavigate();

    const handleCourseSelect = (courseId: string) => {
        navigate("/c/new", {replace: true})
        setCourseId(courseId);
    }

    const handleTACourseSelect = (courseId: string) => {
        setIsTACourse(true);
        navigate("/c/new", {replace: true})
        setCourseId(courseId);
    }

    const { data, isLoading, isError, error } = useFetchCourses(user?.id || '');

    useEffect(() => {
        if (data) {
            setStudentCourses(data.studentCourses);
            setTACourses(data.taCourses);
            setIsTACourse(false);
        }
    }, [data]);

    useEffect(() => {
        setStudentId(undefined);
        setStudentName(undefined);
    }, []);

    if (isLoading) return <div>Loading courses...</div>;
    if (isError) return <div>Error fetching courses: {(error as Error).message}</div>;

    
    return (
        <>
        { isNav ? 
            <div className="nav-dashboard-container">
                {taCourses.length > 0 && (<section className="nav-section-container">
                    <h2 className="nav-section-heading">Instructor Courses</h2>
                    <div className="nav-course-cards-container">
                        {taCourses.map((course) => (
                            <div
                                key={course.id} className="nav-course-card"
                                onClick={() => handleTACourseSelect(course.id)}
                            >
                                <h3 className="nav-course-title">{course.name}</h3>
                            </div>
                        ))}
                    </div>
                </section>)}

                <section className="nav-section-container">
                    <h2 className="nav-section-heading">Student Courses</h2>
                    <div className="nav-course-cards-container">
                        {studentCourses.length > 0 ? (
                            studentCourses.map((course) => (
                                <div key={course.id} className="nav-course-card"
                                 onClick={() => handleCourseSelect(course.id)}>
                                    <h3 className="nav-course-title">{course.name}</h3>
                                </div>
                            ))
                        ) : (
                            <p className="nav-empty-message">You are not enrolled in any courses as a student</p>
                        )}
                    </div>
                </section>
            </div> : 
            <div className="crs-dashboard-container">
                {taCourses.length > 0 && (<section className="crs-section-container">
                    <h2 className="crs-section-heading">Instructor Courses</h2>
                    <div className="crs-course-cards-container">
                        {taCourses.map((course) => (
                            <div key={course.id} className="crs-course-card"
                                onClick={() => handleTACourseSelect(course.id)}>
                                <h3 className="crs-course-title">{course.name}</h3>
                                <p className="crs-course-description">{course.description}</p>
                                <p className="crs-course-professor">By {course.professor.userId.name}</p>
                            </div>
                        ))}
                    </div>
                </section>)}
                <section className="crs-section-container">
                    <h2 className="crs-section-heading">Student Courses</h2>
                    <div className="crs-course-cards-container">
                        {studentCourses.length > 0 ? (
                            studentCourses.map((course) => (
                                <div key={course.id} className="crs-course-card"
                                 onClick={() => handleCourseSelect(course.id)}>
                                    <h3 className="crs-course-title">{course.name}</h3>
                                    <p className="crs-course-description">{course.description}</p>
                                    <p className="crs-course-professor">By {course.professor.userId.name}</p>
                                </div>
                            ))
                        ) : (
                            <p className="crs-empty-message">You are not enrolled in any courses as a student.</p>
                        )}
                    </div>
                </section>
            </div>
        }</>
    );
};

export default StudentCourseCards;
