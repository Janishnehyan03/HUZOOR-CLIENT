// SubjectAttendance.js
import { Link, useParams } from "react-router-dom";
import Axios from "../../Axios";
import { useEffect, useState } from "react";
import Loading from "../../components/Loading";

const SubjectAttendance = () => {
  const { subjectId } = useParams<string>();
  const [statistics, setStatistics] = useState<any[]>([]);
  const [subject, setSubject] = useState<any>();
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const subjectResponse = await Axios.get(`/subject/${subjectId}`);
        const subjectData = subjectResponse.data;
        setSubject(subjectData.subject);

        const attendanceResponse = await Axios.get(
          `/attendance/get/statistics?subject=${subjectId}`
        );

        setStatistics(attendanceResponse.data.statistics);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subjectId]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800">{subject?.name}</h1>
        <p className="text-gray-500 mt-1">Attendance Statistics</p>
      </div>
  
      {/* Statistics Table */}
      {statistics.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admission No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Official
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medical
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Classes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Present
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statistics.map((stat, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/subject-attendance/${subject?._id}/student/${stat?.studentId}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {index + 1}. {stat?.studentName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.admissionNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          stat.attendancePercentage < 85
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {stat.attendancePercentage.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat?.officialPercentage > 0 ? (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                          {stat?.officialPercentage}%
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat?.medicalPercentage > 0 ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          {stat?.medicalPercentage}%
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat?.totalAttendanceCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat?.totalPresentCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
  
      {/* Empty State */}
      {statistics.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">No attendance statistics available</p>
        </div>
      )}
    </div>
  </div>
  );
};

export default SubjectAttendance;
