// ManageSubjects.js
import Axios from "../../Axios";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  BookOpen,
  GraduationCap,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  BarChart3,
} from "lucide-react";

const ManageSubjects = () => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any[]>([]);

  useEffect(() => {
    // Fetch the list of classes
    Axios.get("/class").then((response) => {
      setClasses(response.data.classes);
    });
  }, []);

  useEffect(() => {
    if (selectedClass) {
      // Fetch the list of subjects for a class
      Axios.get(`/subject?class=${selectedClass}`).then((response) => {
        setSubjects(response.data.subjects);
      });
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedSubject) {
      Axios.get(`/attendance/get/statistics?subject=${selectedSubject}`).then(
        (response) => {
          const data = response.data.statistics;

          // Organize statistics by student
          const organizedData = data.map((item: any) => ({
            studentName: item.studentName,
            admissionNumber: item.admissionNumber,
            attendancePercentage: item.attendancePercentage,
            totalAttendanceCount: item.totalAttendanceCount,
            totalPresentCount: item.totalPresentCount,
          }));

          setStatistics(organizedData);
        }
      );
    }
  }, [selectedSubject]);

  // ✅ Export to Excel without FileSaver
  const exportToExcel = () => {
    if (statistics.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(statistics);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `attendance_${selectedSubject || "report"}.xlsx`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Calculate statistics
  const totalStudents = statistics.length;
  const lowAttendanceCount = statistics.filter(
    (stat) => stat.attendancePercentage < 85
  ).length;
  const averageAttendance =
    totalStudents > 0
      ? (
          statistics.reduce(
            (sum, stat) => sum + stat.attendancePercentage,
            0
          ) / totalStudents
        ).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen px-6 py-8 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8 mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-slate-100/[0.02] [mask-image:radial-gradient(white,transparent_85%)]" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-indigo-500/20 rounded-2xl backdrop-blur-sm border border-indigo-400/20">
              <BookOpen className="w-8 h-8 text-indigo-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                Subject Attendance Management
              </h1>
              <p className="text-indigo-200 mt-1 text-sm">
                Track and analyze attendance by subject and class
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Controls Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Class Selection */}
          <div>
            <label
              htmlFor="class"
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              Select Class
            </label>
            <select
              id="class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="">Choose a class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selection */}
          <div>
            <label
              htmlFor="subjectSelect"
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3"
            >
              <BookOpen className="w-4 h-4 text-teal-600" />
              Select Subject
            </label>
            <select
              id="subjectSelect"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              disabled={!selectedClass}
            >
              <option value="">
                {selectedClass ? "Choose a subject" : "Select a class first"}
              </option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Summary Cards */}
      {statistics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {totalStudents}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-2xl">
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">
                  Average Attendance
                </p>
                <p
                  className={`text-3xl font-bold ${
                    Number(averageAttendance) < 85
                      ? "text-red-600"
                      : "text-emerald-600"
                  }`}
                >
                  {averageAttendance}%
                </p>
              </div>
              <div
                className={`p-3 rounded-2xl ${
                  Number(averageAttendance) < 85
                    ? "bg-red-100"
                    : "bg-emerald-100"
                }`}
              >
                <BarChart3
                  className={`w-8 h-8 ${
                    Number(averageAttendance) < 85
                      ? "text-red-600"
                      : "text-emerald-600"
                  }`}
                />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">
                  Low Attendance
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {lowAttendanceCount}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-2xl">
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Table */}
      {statistics.length > 0 && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Export Button */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-800">
                Student Attendance Records
              </h2>
            </div>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export to Excel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-indigo-700">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Admission Number
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Attendance (%)
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Total
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Presence
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {statistics.map((stat, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50"
                    } hover:bg-indigo-50 transition-colors`}
                  >
                    <td className="py-4 px-6 text-slate-900 font-semibold">
                      {stat.studentName}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {stat.admissionNumber}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
                          stat.attendancePercentage < 85
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {stat.attendancePercentage < 85 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <TrendingUp className="w-3 h-3" />
                        )}
                        {stat.attendancePercentage.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium">
                      {stat.totalAttendanceCount}
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium">
                      {stat.totalPresentCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!statistics.length && selectedSubject && (
        <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl border-2 border-dashed border-slate-300 p-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-200 mb-4">
              <BarChart3 className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              No Attendance Data
            </h3>
            <p className="text-slate-500 text-sm">
              No attendance records found for the selected subject
            </p>
          </div>
        </div>
      )}

      {/* Initial Empty State */}
      {!selectedClass && !selectedSubject && (
        <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl border-2 border-dashed border-slate-300 p-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-200 mb-4">
              <BookOpen className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Get Started
            </h3>
            <p className="text-slate-500 text-sm">
              Please select a class and subject to view attendance statistics
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubjects;
