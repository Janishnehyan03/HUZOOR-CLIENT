// ManageSubjects.js
import Axios from "../../Axios";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

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

  return (
    <div className="p-8 bg-gradient-to-br from-green-50 to-green-100 min-h-screen rounded-3xl backdrop-blur-xl mx-auto shadow-2xl max-w-4xl">
      <div className="mb-8">
        <label
          htmlFor="class"
          className="block text-green-800 font-bold text-lg mb-3"
        >
          Select A Class:
        </label>
        <select
          id="class"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="block w-full bg-white border border-green-300 hover:border-green-500 px-4 py-3 rounded-lg shadow-md focus:outline-none focus:ring-4 focus:ring-green-300 transition duration-300"
        >
          <option value="">Select a class</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-8">
        <label
          htmlFor="subjectSelect"
          className="block text-green-800 font-bold text-lg mb-3"
        >
          Select Subject:
        </label>
        <select
          id="subjectSelect"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="block w-full bg-white border border-green-300 hover:border-green-500 px-4 py-3 rounded-lg shadow-md focus:outline-none focus:ring-4 focus:ring-green-300 transition duration-300"
        >
          <option value="">Select a subject</option>
          {subjects.map((subject) => (
            <option key={subject._id} value={subject._id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {statistics.length > 0 && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-300"
            >
              📊 Export to Excel
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl shadow-xl border border-green-200">
            <table className="min-w-full bg-white">
              <thead className="bg-green-500 text-white text-sm uppercase tracking-wide">
                <tr>
                  <th className="py-4 px-6 text-left">Student Name</th>
                  <th className="py-4 px-6 text-left">Admission Number</th>
                  <th className="py-4 px-6 text-left">Attendance (%)</th>
                  <th className="py-4 px-6 text-left">Total</th>
                  <th className="py-4 px-6 text-left">Presence</th>
                </tr>
              </thead>
              <tbody>
                {statistics.map((stat, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-green-50" : "bg-green-100"
                    } hover:bg-green-200 transition-colors duration-300`}
                  >
                    <td className="py-4 px-6">{stat.studentName}</td>
                    <td className="py-4 px-6">{stat.admissionNumber}</td>
                    <td
                      className={`py-4 px-6 font-semibold ${
                        stat.attendancePercentage < 85
                          ? "text-red-600"
                          : "text-green-700"
                      }`}
                    >
                      {stat.attendancePercentage.toFixed(2)}%
                    </td>
                    <td className="py-4 px-6">{stat.totalAttendanceCount}</td>
                    <td className="py-4 px-6">{stat.totalPresentCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageSubjects;
