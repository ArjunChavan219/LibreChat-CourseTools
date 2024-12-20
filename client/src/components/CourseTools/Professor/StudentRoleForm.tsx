
import React, { useState } from 'react';
import { TStudent } from 'librechat-data-provider';

interface StudentRoleFormProps {
    onSubmit: (data: 'Student' | 'TA') => void;
    studentData?: TStudent;
    type: 'Student' | 'TA';
}

const StudentRoleForm: React.FC<StudentRoleFormProps> = ({
    onSubmit,
    studentData,
    type,
}) => {
    const [role, setRole] = useState<'Student' | 'TA'>(studentData?.type || 'Student');

    const handleSubmit = (e: React.FormEvent) => {
        onSubmit(role);
    };

    return (
        <div className="modal-container">
            <div className="modal-header">
                <h2>Edit Student Role</h2>
            </div>
            <div className="modal-form">
                <div className="form-group">
                    <label>
                        Name: <b>{studentData?.name}</b>
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        Email: <b>{studentData?.email}</b>
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        Role:
                        <select
                            value={role === 'Student' ? 'S' : 'T'}
                            onChange={(e) => setRole(e.target.value === 'S' ? 'Student' : 'TA')}
                            className="form-select"
                        >
                            <option value='S'>Student</option>
                            <option value='T'>TA</option>
                        </select>
                    </label>
                </div>
                <button onClick={handleSubmit} className="modal-save-button">Save</button>
            </div>
        </div>

    );
};

export default StudentRoleForm;

