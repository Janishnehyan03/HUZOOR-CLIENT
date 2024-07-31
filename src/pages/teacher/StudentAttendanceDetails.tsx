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
      <h1 className="text-3xl text-center font-bold mb-6 text-gray-800 uppercase">
        Absence Report
      </h1>
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-6 mb-6 shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          {statistics.studentName}
        </h2>
        <p className="text-gray-800 mb-2">{statistics.admissionNumber}</p>

        <p className="text-gray-800 mb-2">
          <span className="font-semibold text-gray-600">Total Attendance:</span>{" "}
          {statistics.totalPresentCount} / {statistics.totalAttendanceCount}
        </p>
        <p className="text-gray-800 mb-2">
          <span className="font-semibold text-gray-600">
            Attendance Percentage:
          </span>{" "}
          <span className="font-bold text-green-600">
            {statistics.attendancePercentage.toFixed(2)}%
          </span>
        </p>
        <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-800">
          Absent Dates:
        </h3>
        <ul className="list-disc list-inside text-gray-800">
          {statistics.absenceDates.length === 0 ? (
            <p className="text-gray-500">No absences recorded</p>
          ) : (
            statistics.absenceDates.map((date: any, index: number) => (
              <li key={index} className="mb-2">
                <span className="text-red-500 font-semibold">
                  {dayjs(date).format("dddd, MMMM D, YYYY")}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default AbsenceStatistics;
