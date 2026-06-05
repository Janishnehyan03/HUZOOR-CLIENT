import React, { useEffect, useState } from "react";
import Axios from "../../../Axios";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface Statistics {
  subjectName: string;
  attendancePercentage: number;
  totalAttendanceCount: number;
  totalAbsenceCount: number;
  medicalPercentage: number;
  officialPercentage: number;
}

interface Props {
  studentId: string;
}

const ManageStudentAttendance: React.FC<Props> = ({ studentId }) => {
  const [statistics, setStatistics] = useState<Statistics[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [overallPercentage, setOverallPercentage] = useState<number>(0);
  const [medicalPercentage, setMedicalPercentage] = useState<number>(0);
  const [officialPercentage, setOfficialPercentage] = useState<number>(0);
  const [totalMinusCount, setTotalMinusCount] = useState<number>(0);

  const percentageColor =
    Math.floor(overallPercentage) < 85 ? "text-red-600" : "text-teal-600";

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      try {
        const response = await Axios.get("/attendance/get/statistics", {
          params: { student: studentId },
        });
        setStatistics(response.data.statistics);
        setOverallPercentage(response.data.overallAttendance);
        setMedicalPercentage(response.data.medicalPercentage);
        setOfficialPercentage(response.data.officialPercentage);
        setTotalMinusCount(response.data.totalMinusCount || 0);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStatistics();
    }
  }, [studentId]);

  if (loading) {
    return <div className="text-center text-gray-500 mt-4">Loading...</div>;
  }

  if (!statistics.length) {
    return (
      <div className="text-center text-gray-500 mt-4">
        Select a student to view statistics.
      </div>
    );
  }

  return (
    <div className="mt-8 w-full max-w-6xl mx-auto px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          📈 Attendance Statistics
        </h2>
        <Link to={`/attendance-details/student/${studentId}`}>
          <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-full transition-all shadow-md hover:shadow-lg">
            Go To Details
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>

      {/* Count summary */}
      {(() => {
        const totalClasses = statistics.reduce((s, st) => s + st.totalAttendanceCount, 0);
        const totalAbsences = statistics.reduce((s, st) => s + st.totalAbsenceCount, 0);
        const totalPresent = totalClasses - totalAbsences;
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-500 mb-0.5">Total Classes</p>
              <p className="text-2xl font-bold text-indigo-700">{totalClasses}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-500 mb-0.5">Present</p>
              <p className="text-2xl font-bold text-emerald-700">{totalPresent}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-500 mb-0.5">Absent</p>
              <p className="text-2xl font-bold text-amber-700">{totalAbsences}</p>
            </div>
            {totalMinusCount > 0 ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-rose-500 mb-0.5">Minus Deduction</p>
                <p className="text-2xl font-bold text-rose-700">−{totalMinusCount}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-0.5">Minus Deduction</p>
                <p className="text-2xl font-bold text-slate-400">0</p>
              </div>
            )}
          </div>
        );
      })()}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div
          className={`rounded-lg px-4 py-3 font-medium text-gray-600 ${percentageColor}`}
        >
          Overall Percentage: {Math.floor(overallPercentage)}%
        </div>
        <div
          className={`rounded-lg px-4 py-3 font-medium text-gray-600 ${percentageColor}`}
        >
          Medical Percentage: {Math.floor(medicalPercentage)}%
        </div>
        <div
          className={`rounded-lg px-4 py-3 font-medium text-gray-600 ${percentageColor}`}
        >
          Official Percentage: {Math.floor(officialPercentage)}%
        </div>
      </div>

      <div className="overflow-x-auto shadow rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Attendance %
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total Attendance
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Not Present
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {statistics.map((stat) => (
              <tr key={stat.subjectName} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700">
                  {stat.subjectName}
                </td>
                <td
                  className={`px-6 py-4 text-sm ${
                    stat.attendancePercentage < 85
                      ? "text-red-600 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {stat?.attendancePercentage?.toFixed(2)}%
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {stat.totalAttendanceCount}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {stat.totalAbsenceCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageStudentAttendance;
