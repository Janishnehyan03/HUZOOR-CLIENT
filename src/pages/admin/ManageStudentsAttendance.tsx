import React, { useState } from "react";
import StudentsStatisticsPage from "./components/StudentStatistics";
import StudentSelect from "./components/StudentSelection";
import { GraduationCap, TrendingUp, UserSearch } from "lucide-react";

const ManageStudentsAttendance: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<string>("");

  return (
    <div className="w-full mx-auto px-6 py-8 min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8 mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-slate-100/[0.02] [mask-image:radial-gradient(white,transparent_85%)]" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-indigo-500/20 rounded-2xl backdrop-blur-sm border border-indigo-400/20">
              <GraduationCap className="w-8 h-8 text-indigo-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                Student Attendance Analytics
              </h1>
              <p className="text-indigo-200 mt-1 text-sm">
                Track individual student performance across all subjects
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <UserSearch className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800">
            Select Student
          </h2>
        </div>
        <StudentSelect onSelect={setSelectedStudent} />
      </div>

      {/* Statistics Panel */}
      {selectedStudent ? (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-teal-100 rounded-xl">
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">
              Performance Overview
            </h2>
          </div>
          <StudentsStatisticsPage studentId={selectedStudent} />
        </div>
      ) : (
        <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl border-2 border-dashed border-slate-300 p-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-200 mb-4">
              <UserSearch className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              No Student Selected
            </h3>
            <p className="text-slate-500 text-sm">
              Please select a class and student to view their attendance statistics
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudentsAttendance;
