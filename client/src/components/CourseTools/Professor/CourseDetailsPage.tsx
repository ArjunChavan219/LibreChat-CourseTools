import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from '../Shared/Modal';
import StudentListForm from './StudentListForm';
import StudentRoleForm from './StudentRoleForm';
import { useAuthContext } from '~/hooks';
import './CourseDetailsPage.css';
import {
    useFetchRoster,
    useGenerateInviteLink,
    useAddStudentToCourse,
    useChangeStudentRole,
    useRemoveStudentFromCourse
} from 'librechat-data-provider/react-query';
import { TStudent } from 'librechat-data-provider';


const CourseDetailsPage: React.FC = () => {
    const { courseId: course, setStudentId, setStudentName } = useAuthContext();
    const courseId = course || "reset";
    const navigate = useNavigate();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isBatchConfirmModalOpen, setIsBatchConfirmModalOpen] = useState(false);

    const [student, setStudent] = useState<TStudent[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<TStudent | null>(null);
    const [studentToDelete, setStudentToDelete] = useState<TStudent | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'All' | 'Student' | 'TA'>('All');
    
    const [isCopied, setIsCopied] = useState(false);

    const { mutate: generateLink } = useGenerateInviteLink(
        () => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        },
        (error) => {
            console.error('Error generating invite link:', error);
        }
    );

    const handleGenerateLink = () => {
        generateLink(courseId);
    };

    
    const handleSelectToggle = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
        );
    };

    // Adding Students

    const { mutate: addStudentToCourse } = useAddStudentToCourse();

    const handleAddClick = () => {
        setSelectedStudent(null);
        setIsAddModalOpen(true);
    };
    
    const handleAdd = async (studentsData: TStudent[]) => {
        const newStudents: TStudent[] = [];
        for (const studentData of studentsData) {            
            try {
                // Here we need to create a promise and handle it
                addStudentToCourse({ courseId, studentId: studentData.id, isTA: studentData.type === "TA" });
                newStudents.push(studentData);
            } catch (error) {
                console.error(error);
            }
        }
        
        setStudent((prev) => [...prev, ...newStudents]);
        setIsAddModalOpen(false);
        setSelectedStudent(null);
    };

    const handleEditClick = (student: TStudent) => {
        setSelectedStudent(student);
        setIsEditModalOpen(true);
    };


    const changeRole = useChangeStudentRole();

    const handleEdit = (studentRole: 'Student' | 'TA') => {
        if (selectedStudent){
            changeRole.mutate({
                courseId,
                studentId: selectedStudent.id,
                newRole: studentRole
            }, {
                onSuccess: () => {
                    setStudent((prev) =>
                        prev.map((student) =>
                            student.id === selectedStudent.id ? { ...student, type: studentRole } : student
                        )
                    );
                    setIsEditModalOpen(false);
                    setSelectedStudent(null);
                },
                onError: (error) => {
                    console.error('Failed to update role:', error);
                }
            });
        }
    };

    // Remove students
    const { mutateAsync: removeStudentFromCourse } = useRemoveStudentFromCourse();

    const handleDeleteClick = (student: TStudent) => {
        setSelectedIds([]);
        setStudentToDelete(student);
        setIsConfirmModalOpen(true);
    };
    const confirmDelete = async () => {      
        if (studentToDelete){
            if (await removeStudentFromCourse({
                courseId, 
                studentId: studentToDelete?.id, 
                isTA: studentToDelete?.type === 'TA'
            })) {
                setStudent((prev) => prev.filter((student) => student.id !== studentToDelete?.id));
                setIsConfirmModalOpen(false);
                setStudentToDelete(null);
            }
        }
    };

    const handleBatchDeleteClick = () => {
        setIsBatchConfirmModalOpen(true);
    };

    const confirmBatchDelete = async () => {
        try {
            const studentsToDelete = selectedIds.filter(
                (id) => student.find((student) => student.id === id)?.type === 'Student'
            );
            const tasToDelete = selectedIds.filter(
                (id) => student.find((student) => student.id === id)?.type === 'TA'
            );

            await Promise.all(studentsToDelete.map(studentId => removeStudentFromCourse({ courseId, studentId, isTA: false })));
            await Promise.all(tasToDelete.map(taId => removeStudentFromCourse({ courseId, studentId: taId, isTA: true })));

    
            setStudent((prev) => prev.filter((student) => !selectedIds.includes(student.id)));
            setSelectedIds([]);
            setIsBatchConfirmModalOpen(false);
        } catch (error) {
            console.error('Error during batch delete:', error);
        }
    };


    const filteredStudent = student.filter(
        (student) =>
            (filterType === 'All' || student.type === filterType) &&
            (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleViewChats = (student: TStudent) => {
        // Placeholder logic to handle viewing chats for the selected student
        setStudentId(student.userId);
        setStudentName(student.name);
        // Future: Navigate or trigger a modal to show the chats
    };
    
    const { data, isError, error, isLoading } = useFetchRoster(courseId);
    
    useEffect(() => {
        if (data) {
            const studentsWithType = data.students.map(student => ({
                ...student,
                type: 'Student',
            }));
            const tasWithType = data.tas.map(ta => ({
                ...ta,
                type: 'TA',
            }));
            setStudent([...studentsWithType, ...tasWithType]);
        }
    }, [data]);

    useEffect(() => {
        setStudentId(undefined);
        setStudentName(undefined);
    }, [courseId]);

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error: {(error as Error).message}</div>;

    if (courseId === "reset") {
        console.error("Course ID is undefined");

        navigate("/error");
        return <p>Error: Course ID is missing</p>;
    }

    return (
        <div className="roster-management-container">
            <h1 className="roster-title">Roster Management</h1>
            <div className="roster-controls">
                <input
                    type="text"
                    placeholder="Search by name or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as 'All' | 'Student' | 'TA')}
                    className="filter-select"
                >
                    <option value="All">All</option>
                    <option value="Student">Student</option>
                    <option value="TA">TA</option>
                </select>
                <button onClick={handleAddClick} className="add-button">Add Student or TA</button>
                <button
                    onClick={handleBatchDeleteClick}
                    disabled={selectedIds.length === 0}
                    className="multi-delete-button"
                >
                    Delete Selected
                </button>
                <div className="invite-button-container">
                    <button onClick={handleGenerateLink} className="invite-button">Generate Invite Link</button>
                    {isCopied && (
                        <div className="link-copied-tooltip">
                            Link copied to clipboard!
                        </div>
                    )}
                </div>
            </div>
            <table className="roster-table">
                <thead>
                    <tr>
                        <th className="roster-table-header" style={{textAlign: "center"}}>
                            <input
                                type="checkbox"
                                onChange={(e) =>
                                    setSelectedIds(
                                        e.target.checked
                                            ? filteredStudent.map((student) => student.id)
                                            : []
                                    )
                                }
                                checked={
                                    selectedIds.length === filteredStudent.length &&
                                    filteredStudent.length > 0
                                }
                                className="select-all-checkbox"
                            />
                        </th>
                        <th className="roster-table-header">Name</th>
                        <th className="roster-table-header">Email</th>
                        <th className="roster-table-header">Type</th>
                        <th className="roster-table-header" style={{textAlign: 'center'}}>Actions</th>
                        <th className="roster-table-header" style={{textAlign: 'center'}}>Chats</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredStudent.map((student) => (
                        <tr key={student.id} className="student-row">
                            <td style={{textAlign: "center"}}>
                                <input
                                    type="checkbox"
                                    onChange={() => handleSelectToggle(student.id)}
                                    checked={selectedIds.includes(student.id)}
                                    className="row-checkbox"
                                />
                            </td>
                            <td style={{paddingLeft: "10px"}}>{student.name}</td>
                            <td>{student.email}</td>
                            <td>{student.type}</td>
                            <td className="action-buttons">
                                <button onClick={() => handleEditClick(student)} className="edit-button">
                                    Edit
                                </button>
                                <button onClick={() => handleDeleteClick(student)} className="delete-button">
                                    Delete
                                </button>
                            </td>
                            <td className='chat-button'>
                                {student.type === 'Student' && <button
                                    onClick={() => handleViewChats(student)}
                                    className="view-chat-button"
                                >
                                    View
                                </button>}
                            </td>
                        </tr>
                    ))}
                </tbody>

            </table>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                <StudentListForm
                    courseId={courseId}
                    onAddStudents={handleAdd}
                />
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <StudentRoleForm
                    onSubmit={handleEdit}
                    studentData={selectedStudent || undefined}
                    type={selectedStudent?.type || 'Student'}
                />
            </Modal>

            <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}>
                <div>
                    <div className="modal-header">
                        <h2>Delete Student</h2>
                    </div>
                    <p className='form-label'>Are you sure you want to delete this student?</p>
                    <div className="modal-footer">
                        <button onClick={confirmDelete} className="confirm-button">Yes</button>
                        <button onClick={() => setIsConfirmModalOpen(false)} className="cancel-button">No</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isBatchConfirmModalOpen} onClose={() => setIsBatchConfirmModalOpen(false)}>
                <div>
                    <div className="modal-header">
                        <h2>Delete Students</h2>
                    </div>
                    <p className='form-label'>Are you sure you want to delete the selected students?</p>
                    <div className="modal-footer">
                        <button onClick={confirmBatchDelete} className="confirm-button">Yes</button>
                        <button onClick={() => setIsBatchConfirmModalOpen(false)} className="cancel-button">No</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CourseDetailsPage;
