import React, { useState } from "react";
import StudentsStatisticsPage from "./components/StudentStatistics";
import StudentSelect from "./components/StudentSelection";

const ManageStudentsAttendance: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<string>("");

  return (
    <div className="w-full mx-auto px-4 py-8 min-h-screen">
      <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-10 transition-all">
        <h1 className="text-2xl text-center sm:text-3xl font-semibold text-gray-800 mb-6 flex items-center gap-3 justify-center ">
           Student Attendance Statistics
        </h1>

        {/* Student Selector */}
        <div className="mb-6">
          <StudentSelect onSelect={setSelectedStudent} />
        </div>

        {/* Statistics Panel */}
        {selectedStudent && (
          <div className="mt-6">
            <StudentsStatisticsPage studentId={selectedStudent} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStudentsAttendance;
