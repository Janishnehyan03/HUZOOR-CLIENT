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

  console.log(statistics);

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
    <div className="p-4 bg-green-50 min-h-screen">
      <h1 className="text-center font-bold text-2xl my-2 text-blue-700">
        {" "}
        {subject?.name}
      </h1>
      {statistics.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead>
              <tr className="bg-green-200">
                <th className="py-2 px-4 border-b">Student Name</th>
                <th className="py-2 px-4 border-b">Admission Number</th>
                <th className="py-2 px-4 border-b">Attendance Percentage</th>
                <th className="py-2 px-4 border-b">Official </th>
                <th className="py-2 px-4 border-b">Medical</th>
                <th className="py-2 px-4 border-b">Total Attendance </th>
                <th className="py-2 px-4 border-b">Presence </th>
              </tr>
            </thead>
            <tbody>
              {statistics.map((stat, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-green-50" : "bg-green-100"}
                >
                  <td className="py-2 px-4 border-b">
                    <Link
                      to={`/subject-attendance/${subject?._id}/student/${stat?.studentId}`}
                      className="hover:text-primary uppercase"
                    >
                      {index + 1}. {stat?.studentName}
                    </Link>
                  </td>
                  <td className="py-2 px-4 border-b">{stat.admissionNumber}</td>
                  <td
                    className={`py-2 px-4 border-b ${
                      stat.attendancePercentage < 85
                        ? "text-red-600 bg-red-200"
                        : ""
                    }`}
                  >
                    {stat.attendancePercentage.toFixed(2)}%
                  </td>
                  <td className="py-2 px-4 border-b">
                    {stat?.officialPercentage > 0 &&
                      `${stat?.officialPercentage}%`}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {stat?.medicalPercentage > 0 &&
                      `${stat?.medicalPercentage}%`}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {stat?.totalAttendanceCount}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {stat?.totalPresentCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubjectAttendance;
