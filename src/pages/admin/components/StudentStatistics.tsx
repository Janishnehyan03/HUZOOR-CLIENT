import React, { useEffect, useState } from "react";
import Axios from "../../../Axios";
import { Link } from "react-router-dom";

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
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Attendance Statistics
        </h2>
        <Link to={`/attendance-details/student/${studentId}`}>
          <button className="bg-gray-700 px-3 my-3 py-1 border-gray-600 border hover:text-gray-800 hover:bg-transparent rounded-3xl text-white">
            Go To Details
          </button>
        </Link>
      </div>
      <div className="flex flex-wrap space-x-3 space-y-3 m-3">
        <h1
          className={` font-semibold my-3  p-2 ${percentageColor}`}
        >
          Overall Percentage {Math.floor(overallPercentage)}%
        </h1>
        <h1
          className={` font-semibold my-3  p-2 ${percentageColor}`}
        >
          Medical Percentage {Math.floor(medicalPercentage)}%
        </h1>
        <h1
          className={` font-semibold my-3  p-2 ${percentageColor}`}
        >
          Official Percentage {Math.floor(officialPercentage)}%
        </h1>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border-collapse">
          <thead>
            <tr>
              <th className="py-3 px-6 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                Subject
              </th>
              <th className="py-3 px-6 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                Attendance Percentage
              </th>
              <th className="py-3 px-6 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                Total Attendance
              </th>
              <th className="py-3 px-6 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                Not Present
              </th>
          
            </tr>
          </thead>
          <tbody>
            {statistics.map((stat) => (
              <tr key={stat.subjectName} className="hover:bg-gray-50">
                <td className="py-4 px-6 border-b text-sm text-gray-700">
                  {stat.subjectName}
                </td>
                <td
                  className={`py-4 px-6 border-b text-sm ${
                    stat.attendancePercentage < 85
                      ? "text-red-600"
                      : "text-gray-700"
                  }`}
                >
                  {stat?.attendancePercentage?.toFixed(2)}%
                </td>
                <td className="py-4 px-6 border-b text-sm text-gray-700">
                  {stat.totalAttendanceCount}
                </td>
                <td className="py-4 px-6 border-b text-sm text-gray-700">
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
