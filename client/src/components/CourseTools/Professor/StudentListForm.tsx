import React, { useState, useEffect } from 'react';
import { TStudent } from 'librechat-data-provider';
import { useFetchNewStudents } from 'librechat-data-provider/react-query';

interface StudentListFormProps {
    courseId: string;
    onAddStudents: (selectedStudents: TStudent[]) => void;
}

const StudentListForm: React.FC<StudentListFormProps> = ({ courseId, onAddStudents }) => {
    const [students, setStudents] = useState<TStudent[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<TStudent[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudents, setSelectedStudents] = useState<TStudent[]>([]);

    const { data, isError, error, isLoading } = useFetchNewStudents(courseId);

    useEffect(() => {
        if (data) {
            const studentsWithType = data.map(student => ({ ...student, type: 'Student' as 'Student' }));
            setStudents(studentsWithType);
            setFilteredStudents(studentsWithType);
        }
    }, [data]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);
        setFilteredStudents(
            students.filter(
                (student) =>
                    student.name.toLowerCase().includes(value) ||
                    student.email.toLowerCase().includes(value)
            )
        );
    };

    const handleTypeChange = (id: string, newType: 'Student' | 'TA') => {
        setSelectedStudents((prev) =>
            prev.map((student) =>
                student.id === id ? { ...student, type: newType } : student
            )
        );
    };

    const handleCheckboxToggle = (selectedStudent: TStudent) => {
        setSelectedStudents((prev) => {
            const exists = prev.find((student) => student.id === selectedStudent.id);
            if (exists) {
                return prev.filter((student) => student.id !== selectedStudent.id);
            } else {
                return [...prev, selectedStudent];
            }
        });
    };

    const handleAddClick = () => {
        onAddStudents(selectedStudents);
        setSelectedStudents([]);
    };

    if (isLoading) return <div>Loading...</div>;
    if (isError && error instanceof Error) return <div>Error: {error.message}</div>;

    return (
        <div  style={{width: "600px"}}>
            <div className="modal-header">
                <h2>Add Students</h2>
            </div>
            <div className="modal-body">
                <input
                    type="text"
                    placeholder="Search by name or email"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="form-input search-input"
                />
                <table className="roster-table">
                    <thead>
                        <tr>
                            <th className="roster-table-header" style={{textAlign: "center"}}>
                                <input
                                    type="checkbox"
                                    onChange={(e) =>
                                        setSelectedStudents(
                                            e.target.checked
                                                ? filteredStudents.map((student) => student)
                                                : []
                                        )
                                    }
                                    checked={
                                        selectedStudents.length === filteredStudents.length &&
                                        filteredStudents.length > 0
                                    }
                                    className="select-all-checkbox"
                                />
                            </th>
                            <th className="roster-table-header">Name</th>
                            <th className="roster-table-header">Email</th>
                            <th className="roster-table-header">Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student) => (
                            <tr key={student.id} className="student-row">
                                <td style={{textAlign: "center"}}>
                                    <input
                                        type="checkbox"
                                        onChange={() => handleCheckboxToggle(student)}
                                        checked={selectedStudents.some(
                                            (selected) => selected.id === student.id
                                        )}
                                        className="row-checkbox"
                                    />
                                </td>
                                <td>{student.name}</td>
                                <td>{student.email}</td>
                                <td>
                                    <select
                                        value={
                                            ((selectedStudents.find((s) => s.id === student.id)?.type ||
                                            'Student') === 'Student') ? 'S' : 'T'
                                        }
                                        onChange={(e) => handleTypeChange(student.id, e.target.value === 'S' ? 'Student' : 'TA')}
                                        style={{margin: "10px 0px"}}
                                    >
                                        <option value="S">Student</option>
                                        <option value="T">TA</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="modal-footer">
                <button
                    onClick={handleAddClick}
                    disabled={selectedStudents.length === 0}
                    className="modal-save-button"
                >
                    Add Selected Students
                </button>
            </div>
        </div>

    );
};

export default StudentListForm;
