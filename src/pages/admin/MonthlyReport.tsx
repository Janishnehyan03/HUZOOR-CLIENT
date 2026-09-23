import React, { useState, useEffect } from "react";
import Axios from "../../Axios";
import Loading from "../../components/Loading";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

function MonthlyReport() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(""); // YYYY-MM
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const { data } = await Axios.get("/class");
      setClasses(data.classes);
      if (data.classes.length > 0) {
        setSelectedClass(data.classes[0]._id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchReport = async () => {
    if (!selectedClass || !selectedMonth) return;

    const [year, month] = selectedMonth.split("-");

    try {
      setFetching(true);
      const { data } = await Axios.get(
        `/attendance/get/statistics?class=${selectedClass}&month=${month}&year=${year}`
      );
      setReportData(data.statistics);
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  const { rows: tableRows, subjects: tableSubjects } = React.useMemo(() => {
    if (!reportData || reportData.length === 0) return { rows: [], subjects: [] };
    
    const studentMap = new Map();
    const uniqueSubjects = new Set<string>();

    reportData.forEach((row: any) => {
      uniqueSubjects.add(row.subjectName);

      if (!studentMap.has(row.studentId)) {
        studentMap.set(row.studentId, {
          "Roll No": row.rollNumber || "-",
          "Student Name": row.studentName,
          "Admission No": row.admissionNumber || "-",
          totalPresent: 0,
          totalClasses: 0,
          subjects: {},
        });
      }

      const student = studentMap.get(row.studentId);
      student.totalPresent += row.totalPresentCount || 0;
      student.totalClasses += row.totalAttendanceCount || 0;
      student.subjects[row.subjectName] = row.attendancePercentage
        ? row.attendancePercentage.toFixed(2) + "%"
        : "0.00%";
    });

    const rows = Array.from(studentMap.values()).map((student: any) => {
      const overallPercentage =
        student.totalClasses > 0
          ? ((student.totalPresent / student.totalClasses) * 100).toFixed(2) + "%"
          : "0.00%";

      const rowData: any = {
        "Roll No": student["Roll No"],
        "Student Name": student["Student Name"],
        "Admission No": student["Admission No"],
        "Overall %": overallPercentage,
      };

      Array.from(uniqueSubjects).forEach((subjectName: string) => {
        rowData[subjectName] = student.subjects[subjectName] || "-";
      });

      return rowData;
    });

    return { rows, subjects: Array.from(uniqueSubjects) };
  }, [reportData]);

  const exportToExcel = () => {
    if (tableRows.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(tableRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Report");

    const monthName = new Date(`${selectedMonth}-01`).toLocaleString('default', { month: 'long', year: 'numeric' });
    const selectedClassName = classes.find((c: any) => c._id === selectedClass)?.name || "Class";
    
    XLSX.writeFile(workbook, `${selectedClassName}_Attendance_${monthName}.xlsx`);
  };

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Monthly Report</h1>
          <p className="text-gray-500 mt-2">
            View and export attendance statistics for a specific month.
          </p>
        </div>
        {tableRows.length > 0 && (
          <button
            onClick={exportToExcel}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm"
          >
            <Download className="w-5 h-5" />
            Export Excel
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2.5 border"
            >
              {classes.map((c: any) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2.5 border"
            />
          </div>
          <div>
            <button
              onClick={handleFetchReport}
              disabled={!selectedClass || !selectedMonth || fetching}
              className="w-full bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm disabled:opacity-70"
            >
              {fetching ? "Loading..." : "Generate Report"}
            </button>
          </div>
        </div>
      </div>

      {tableRows.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["#", "Student Name", "Admission No", "Overall %", ...tableSubjects].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableRows.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {row["Student Name"]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {row["Admission No"]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {row["Overall %"]}
                      </span>
                    </td>
                    {tableSubjects.map((subject) => (
                      <td key={subject} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {row[subject]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        !fetching &&
        selectedMonth && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">No attendance records found for this month.</p>
          </div>
        )
      )}
    </div>
  );
}

export default MonthlyReport;
