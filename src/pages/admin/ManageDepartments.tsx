import { useEffect, useState } from "react";
import Axios from "../../Axios";
import Loading from "../../components/Loading";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Building2,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

interface StudentData {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  rollNumber: number;
  subjects: { [subjectName: string]: number };
  overallPercentage: number;
}

const ManageDepartments = () => {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [classes, setClasses] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<StudentData[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    Axios.get("/class").then((response) => {
      setClasses(response.data.classes);
    });
  }, []);

  useEffect(() => {
    if (selectedClass) {
      setLoading(true);
      Axios.get(`/attendance/get/statistics?class=${selectedClass}`).then(
        (response) => {
          const data = response.data.statistics;

          // Extract unique subjects
          const uniqueSubjects: any[] = [
            ...new Set(data.map((item: any) => item.subjectName)),
          ];

          // Organize statistics by student
          const organizedData: { [admissionNumber: string]: StudentData } =
            data.reduce((acc: any, item: any) => {
              const {
                studentId,
                studentName,
                admissionNumber,
                rollNumber,
                subjectName,
                attendancePercentage,
              } = item;
              if (!acc[admissionNumber]) {
                acc[admissionNumber] = {
                  studentId,
                  studentName,
                  admissionNumber,
                  rollNumber,
                  subjects: {},
                  overallPercentage: 0,
                };
              }
              acc[admissionNumber].subjects[subjectName] = attendancePercentage;
              return acc;
            }, {});

          // Calculate overall percentage for each student
          Object.values(organizedData).forEach((student: StudentData) => {
            const totalPercentage: number = Object.values(
              student.subjects
            ).reduce(
              (total: number, percentage: number) => total + percentage,
              0
            );
            const recordedSubjectsCount: number = Object.values(
              student.subjects
            ).filter(
              (percentage: number) =>
                percentage !== undefined && percentage !== 0
            ).length;
            if (recordedSubjectsCount > 0) {
              student.overallPercentage =
                totalPercentage / recordedSubjectsCount;
            } else {
              student.overallPercentage = 0;
            }
          });

          const sortedData: StudentData[] = Object.values(organizedData).sort(
            (a: StudentData, b: StudentData) => a.rollNumber - b.rollNumber
          );

          setStatistics(sortedData);
          setSubjects(uniqueSubjects);
          setLoading(false);
        }
      );
    }
  }, [selectedClass]);

  // ✅ Export to Excel
  const exportToExcel = () => {
    const headers = [
      "Roll Number",
      "Student Name",
      "Admission Number",
      "Overall %",
      ...subjects,
    ];

    const rows = statistics.map((stat) => [
      stat.rollNumber,
      stat.studentName,
      stat.admissionNumber,
      `${stat.overallPercentage.toFixed(0)}%`,
      ...subjects.map((subject) =>
        stat.subjects[subject] !== undefined
          ? `${stat.subjects[subject].toFixed(0)}%`
          : "--"
      ),
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Statistics");
    XLSX.writeFile(workbook, "attendance_statistics.xlsx");
  };

  // ✅ Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Attendance Statistics", 14, 10);

    const headers = [
      "Roll Number",
      "Student Name",
      "Admission Number",
      "Overall %",
      ...subjects,
    ];

    const rows = statistics.map((stat) => [
      stat.rollNumber,
      stat.studentName,
      stat.admissionNumber,
      `${stat.overallPercentage.toFixed(0)}%`,
      ...subjects.map((subject) =>
        stat.subjects[subject] !== undefined
          ? `${stat.subjects[subject].toFixed(0)}%`
          : "--"
      ),
    ]);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
    });

    doc.save("attendance_statistics.pdf");
  };

  if (loading) {
    return <Loading />;
  }

  const lowAttendanceCount = statistics.filter(
    (stat) => stat.overallPercentage < 85
  ).length;

  return (
    <div className="min-h-screen px-6 py-8 bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 p-8 mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-slate-100/[0.02] [mask-image:radial-gradient(white,transparent_85%)]" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-teal-500/20 rounded-2xl backdrop-blur-sm border border-teal-400/20">
              <Building2 className="w-8 h-8 text-teal-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                Department Attendance Overview
              </h1>
              <p className="text-teal-200 mt-1 text-sm">
                Comprehensive class-level attendance statistics and analytics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="flex-1">
            <label
              htmlFor="classSelect"
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3"
            >
              <GraduationCap className="w-4 h-4 text-teal-600" />
              Select Class
            </label>
            <select
              id="classSelect"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            >
              <option value="">Choose a class to view statistics</option>
              {classes.map((cls: any) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {statistics.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <FileText className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          )}
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
                  {statistics.length}
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
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">
                  Good Standing
                </p>
                <p className="text-3xl font-bold text-emerald-600">
                  {statistics.length - lowAttendanceCount}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Table */}
      {statistics.length > 0 && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-teal-600 to-teal-700">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Roll No
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Admission No
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Overall %
                  </th>
                  {subjects.map((subject: string) => (
                    <th
                      key={subject}
                      className="py-4 px-6 text-left text-xs font-bold text-white uppercase tracking-wider"
                    >
                      {subject}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {statistics.map((stat: StudentData, index: number) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50"
                    } hover:bg-teal-50 transition-colors`}
                  >
                    <td className="py-4 px-6 text-slate-700 font-semibold">
                      {stat.rollNumber}
                    </td>
                    <td className="py-4 px-6 text-teal-700 font-bold">
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`/attendance-details/student/${stat.studentId}`}
                        className="hover:underline flex items-center gap-2"
                      >
                        {stat.studentName}
                      </a>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {stat.admissionNumber}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
                          stat.overallPercentage < 85
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {stat.overallPercentage < 85 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <TrendingUp className="w-3 h-3" />
                        )}
                        {stat.overallPercentage.toFixed(0)}%
                      </span>
                    </td>
                    {subjects.map((subject: string) => (
                      <td key={subject} className="py-4 px-6 text-center">
                        {stat.subjects[subject] !== undefined &&
                        stat.subjects[subject] !== 0 ? (
                          <span
                            className={`inline-block px-2 py-1 rounded-lg text-sm font-semibold ${
                              stat.subjects[subject] < 85
                                ? "bg-red-100 text-red-700"
                                : "text-slate-700"
                            }`}
                          >
                            {stat.subjects[subject].toFixed(0)}%
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">--</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && statistics.length === 0 && selectedClass && (
        <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl border-2 border-dashed border-slate-300 p-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-200 mb-4">
              <Building2 className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              No Statistics Available
            </h3>
            <p className="text-slate-500 text-sm">
              No attendance data found for the selected class
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDepartments;
