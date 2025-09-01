import { useEffect, useState } from "react";
import Axios from "../../Axios";
import Loading from "../../components/Loading";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  return (
    <div className="p-6 bg-gray-50 min-h-screen mx-auto rounded-2xl shadow-lg">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <label
            htmlFor="classSelect"
            className="block text-gray-900 font-semibold mb-2 text-lg"
          >
            Select Class
          </label>
          <select
            id="classSelect"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 transition-all"
          >
            <option value="">Select a class</option>
            {classes.map((cls: any) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {statistics.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
            >
              Export Excel
            </button>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
            >
              Export PDF
            </button>
          </div>
        )}
      </div>

      {statistics.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-blue-600 text-white text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Roll Number</th>
                  <th className="py-3 px-6">Student Name</th>
                  <th className="py-3 px-6">Admission Number</th>
                  <th className="py-3 px-6">Overall %</th>
                  {subjects.map((subject: string) => (
                    <th key={subject} className="py-3 px-6">
                      {subject}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {statistics.map((stat: StudentData, index: number) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-blue-50"
                    } hover:bg-blue-100 transition`}
                  >
                    <td className="py-3 px-6 text-gray-700 font-medium">
                      {stat.rollNumber}
                    </td>
                    <td className="py-3 px-6 text-blue-700 font-semibold">
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`/attendance-details/student/${stat.studentId}`}
                        className="hover:underline"
                      >
                        {stat.studentName}
                      </a>
                    </td>
                    <td className="py-3 px-6 text-gray-700">
                      {stat.admissionNumber}
                    </td>
                    <td
                      className={`py-3 px-6 font-semibold ${
                        stat.overallPercentage < 85
                          ? "text-red-600"
                          : "text-blue-700"
                      }`}
                    >
                      {stat.overallPercentage.toFixed(0)}%
                    </td>
                    {subjects.map((subject: string) => (
                      <td
                        key={subject}
                        className={`py-3 px-6 text-center ${
                          stat.subjects[subject] !== undefined &&
                          stat.subjects[subject] !== 0 &&
                          stat.subjects[subject] < 85
                            ? "text-red-600 font-semibold"
                            : "text-gray-800"
                        }`}
                      >
                        {stat.subjects[subject] !== undefined
                          ? `${stat.subjects[subject].toFixed(0)}%`
                          : "--"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDepartments;
