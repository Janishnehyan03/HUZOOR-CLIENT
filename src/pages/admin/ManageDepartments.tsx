import { useEffect, useState } from "react";
import Axios from "../../Axios";
import Loading from "../../components/Loading";

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
                  overallPercentage: 0, // Initialize overall percentage
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
                totalPercentage / recordedSubjectsCount; // Divide by the number of recorded subjects
            } else {
              student.overallPercentage = 0; // Set overall percentage to 0 if no attendance data recorded
            }
          });

          // Convert the organized data to an array and sort by rollNumber
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

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-4 bg-green-50 min-h-screen mx-auto my-6">
      <div className="mb-4">
        <label
          htmlFor="classSelect"
          className="block text-green-800 font-bold mb-2"
        >
          Select A Class:
        </label>
        <select
          id="classSelect"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="block appearance-none w-full bg-white border border-green-400 hover:border-green-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:ring focus:ring-green-300"
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
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow rounded-lg">
            <thead>
              <tr className="bg-green-200 text-[13px]">
                <th className="py-2 px-2 border-b">Roll Number</th>
                <th className="py-2 px-2 border-b">Student Name</th>
                <th className="py-2 px-2 border-b">Admission Number</th>
                <th className="py-2 px-2 border-b">Overall Percentage</th>
                {subjects.map((subject: string) => (
                  <th key={subject} className="py-2 px-2 border-b">
                    {subject}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statistics.map((stat: StudentData, index: number) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-green-50" : "bg-green-100"}
                >
                    <td className="py-2 px-4 border-b">{stat.rollNumber}</td>
                  <td className="py-2 text-primary px-4 border-b">
                    <a
                      target="_blank"
                      href={`/attendance-details/student/${stat.studentId}`}
                    >
                      {stat.studentName}
                    </a>
                  </td>
                  <td className="py-2 px-4 border-b">{stat.admissionNumber}</td>
                  <td
                    className={`py-2 px-4 border-b ${
                      stat.overallPercentage < 85 ? "text-red-500" : ""
                    }`}
                  >
                    {stat.overallPercentage.toFixed(0)}%
                  </td>
                  {subjects.map((subject: string) => (
                    <td
                      key={subject}
                      className={`py-2 px-4 border-b ${
                        stat.subjects[subject] !== undefined &&
                        stat.subjects[subject] !== 0 &&
                        stat.subjects[subject] < 85
                          ? "text-red-600"
                          : ""
                      }`}
                    >
                      {stat.subjects[subject] !== undefined
                        ? `${stat.subjects[subject].toFixed(0)}%` // Convert to fixed 0 decimal places and append '%'
                        : ""}
                    </td>
                  ))}
            

                  {/* Convert overallPercentage to percentage */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageDepartments;
