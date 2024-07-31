import React, { useState } from 'react';
import StudentsStatisticsPage from './components/StudentStatistics';
import StudentSelect from './components/StudentSelection';

const ManageStudentsAttendance: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<string>('');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Student Attendance Statistics</h1>
      <StudentSelect onSelect={setSelectedStudent} />
      {selectedStudent && <StudentsStatisticsPage studentId={selectedStudent} />}
    </div>
  );
};

export default ManageStudentsAttendance;
