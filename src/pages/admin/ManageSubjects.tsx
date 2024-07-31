// ManageSubjects.js
import Axios from "../../Axios";
import { useEffect, useState } from "react";

const ManageSubjects = () => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any[]>([]);

  useEffect(() => {
    // Fetch the list of subjects
    Axios.get("/class").then((response) => {
      setClasses(response.data.classes);
    });
  }, []);

  useEffect(() => {
    // Fetch the list of subjects
    Axios.get(`/subject?class=${selectedClass}`).then((response) => {
      setSubjects(response.data.subjects);
    });
  }, [selectedClass]);

  useEffect(() => {
    if (selectedSubject) {
      Axios.get(`/attendance/get/statistics?subject=${selectedSubject}`).then(
        (response) => {
          const data = response.data.statistics;

          console.log(data);

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

  return (
    <div className="p-4 bg-green-50 min-h-screen">
      <div className="mb-4">
        <label
          htmlFor="subjectSelect"
          className="block text-green-800 font-bold mb-2"
        >
          Select A Class :
        </label>
        <select
          id="class"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="block appearance-none w-full bg-white border border-green-400 hover:border-green-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:ring focus:ring-green-300"
        >
          <option value="">Select a class </option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label
          htmlFor="subjectSelect"
          className="block text-green-800 font-bold mb-2"
        >
          Select Subject:
        </label>
        <select
          id="subjectSelect"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="block appearance-none w-full bg-white border border-green-400 hover:border-green-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:ring focus:ring-green-300"
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
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead>
              <tr className="bg-green-200">
                <th className="py-2 px-4 border-b">Student Name</th>
                <th className="py-2 px-4 border-b">Admission Number</th>
                <th className="py-2 px-4 border-b">Attendance Percentage</th>
                <th className="py-2 px-4 border-b">Total </th>
                <th className="py-2 px-4 border-b">Presence </th>
              </tr>
            </thead>
            <tbody>
              {statistics.map((stat, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-green-50" : "bg-green-100"}
                >
                  <td className="py-2 px-4 border-b">{stat.studentName}</td>
                  <td className="py-2 px-4 border-b">{stat.admissionNumber}</td>
                  <td
                    className={`py-2 px-4 border-b ${
                      stat.attendancePercentage < 85 ? "text-red-600" : ""
                    }`}
                  >
                    {stat.attendancePercentage.toFixed(2)}%
                  </td>
                  <td className="py-2 px-4 border-b">
                    {stat.totalAttendanceCount}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {stat.totalPresentCount}
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

export default ManageSubjects;
