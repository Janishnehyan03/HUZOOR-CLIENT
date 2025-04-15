import Axios from "../../Axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import dayjs from "dayjs";

const AbsenceStatistics = () => {
  const { subjectId, studentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await Axios.get(
          `/attendance/get/absences?subject=${subjectId}&student=${studentId}`
        );
        setStatistics(response.data.statistics[0]); // Assuming the API returns an array with one element
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching data:", error.response);
        setLoading(false);
      }
    };
    fetchStatistics();
  }, [subjectId, studentId]);

  if (loading) {
    return <Loading />;
  }

  if (!statistics) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold text-red-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
    {/* Header */}
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Absence Report</h1>
      <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
    </div>
  
    {/* Student Card */}
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-100">
      {/* Student Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5">
        <h2 className="text-2xl font-bold text-white">{statistics.studentName}</h2>
        <p className="text-blue-100">{statistics.admissionNumber}</p>
      </div>
  
      {/* Stats Section */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Attendance Stats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Total Classes</span>
              <span className="font-semibold">{statistics.totalAttendanceCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Present</span>
              <span className="font-semibold text-green-600">
                {statistics.totalPresentCount}
              </span>
            </div>
          </div>
  
          {/* Percentage Card */}
          <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-blue-600 mb-1">Attendance Percentage</p>
              <p className="text-3xl font-bold text-blue-700">
                {statistics.attendancePercentage.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
  
        {/* Absence Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Absent Dates
          </h3>
  
          {statistics.absenceDates.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-500">No absences recorded</p>
            </div>
          ) : (
            <div className="space-y-3">
              {statistics.absenceDates.map((date: any, index: number) => (
                <div key={index} className="flex items-center bg-red-50 rounded-lg p-3">
                  <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  <span className="font-medium text-gray-700">
                    {dayjs(date).format("dddd, MMMM D, YYYY")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  
    {/* Footer Note */}
    <div className="text-center text-sm text-gray-500 mt-8">
      Report generated on {dayjs().format("MMMM D, YYYY")}
    </div>
  </div>
  );
};

export default AbsenceStatistics;
