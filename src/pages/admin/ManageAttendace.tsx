import { BookOpen, CheckCheck, GraduationCap, User } from "lucide-react";
import { Link } from "react-router-dom";
import Axios from "../../Axios";
import { useEffect, useState } from "react";
import { Class } from "../../lib/types";
import Loading from "../../components/Loading";

const ManageAttendance = () => {
  const [statistics, setStatistics] = useState<any>([]);
  const [classId, setClassId] = useState<string>();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);

  const getBelowAverage = async () => {
    try {
      setLoading(true);
      let { data } = await Axios.get(
        `/attendance/get/below-average?class=${classId}`
      );
      setStatistics(data.statistics);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.log(error.response);
    }
  };

  const getClasses = async () => {
    try {
      let { data } = await Axios.get("/class");
      setClasses(data.classes);
    } catch (error: any) {
      console.log(error.response);
    }
  };

  useEffect(() => {
    getClasses();
  }, []);

  useEffect(() => {
    if (classId) {
      getBelowAverage();
    }
  }, [classId]);

  const groupBySubject = (statistics: any[]) => {
    return statistics.reduce((acc, item) => {
      (acc[item.subjectName] = acc[item.subjectName] || []).push(item);
      return acc;
    }, {});
  };

  const groupedStatistics = groupBySubject(statistics);

  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-2xl bg-gray-800 p-4 text-white font-bold mb-12 text-center">
        Manage Attendance
      </h1>
      <div className="flex flex-wrap justify-center gap-2 px-8">
        <Link to={"/manage-attendance/students"}>
          <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center transform transition-transform duration-300 hover:scale-105 w-80">
            <User className="w-16 h-16 text-teal-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Students
            </h2>
            <button className="mt-auto bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">
              View Students
            </button>
          </div>
        </Link>

        <Link to={"/manage-attendance/departments"}>
          <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center transform transition-transform duration-300 hover:scale-105 w-80">
            <GraduationCap className="w-16 h-16 text-teal-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Departments
            </h2>
            <button className="mt-auto bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">
              View Departments
            </button>
          </div>
        </Link>

        <Link to={"/manage-attendance/subjects"}>
          <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center transform transition-transform duration-300 hover:scale-105 w-80">
            <BookOpen className="w-16 h-16 text-teal-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Subjects
            </h2>
            <button className="mt-auto bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">
              View Subjects
            </button>
          </div>
        </Link>

        <Link to={"/manage-attendance/attendance-clearance"}>
          <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center transform transition-transform duration-300 hover:scale-105 w-80">
            <CheckCheck className="w-16 h-16 text-teal-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Attendance Clearance
            </h2>
            <button className="mt-auto bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">
              Go To Clearance
            </button>
          </div>
        </Link>
      </div>

      <div className=" mt-5">
        <div className="mb-5 mx-auto w-full lg:w-1/3 px-4">
          <h1 className="bg-gray-700 text-white font-semibold p-3 my-2 text-center">
            Students Below 85%
          </h1>
          <label
            htmlFor="class-select"
            className="block text-lg font-medium text-teal-700"
          >
            Select Class
          </label>
          <select
            id="class-select"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="bg-teal-50 border border-teal-300 text-teal-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
          >
            <option value="">Select a class</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div className="container mx-auto px-4 py-8 lg:w-2/3">
          <h2 className="text-2xl font-semibold mb-4">Attendance Statistics</h2>
          {loading ? (
            <Loading />
          ) : (
            <div className="overflow-x-auto">
              {Object.entries(groupedStatistics).map(
                ([subject, students]: any) => (
                  <div key={subject} className="mb-8">
                    <table className="min-w-full bg-white shadow-md rounded-lg mb-4">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                          <th className="py-3 px-2 text-left">Student Name</th>
                          <th className="py-3 px-2 text-left">
                            Adm. No
                          </th>
                          <th className="py-3 px-2 text-left">
                            Attendances
                          </th>
                          <th className="py-3 px-2 text-left">
                            Present
                          </th>
                          <th className="py-3 px-2 text-left">
                            Medical
                          </th>
                          <th className="py-3 px-2 text-left">
                            Official
                          </th>
                          <th className="py-3 px-2 text-left">
                            overall %
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm font-light">
                        {students.map((item: any, index: number) => (
                          <tr
                            key={index}
                            className="border-b border-gray-200 hover:bg-gray-100"
                          >
                            <td className="py-3 px-2 text-left whitespace-nowrap">
                              {item.studentName}
                            </td>
                            <td className="py-3 px-2 text-left">
                              {item.admissionNumber}
                            </td>
                            <td className="py-3 px-2 text-left">
                              {item.totalAttendanceCount}
                            </td>
                            <td className="py-3 px-2 text-left">
                              {item.totalPresentCount}
                            </td>
                            <td className="py-3 px-2 text-left">
                              {item.medicalPercentage?.toFixed(2)}%
                            </td>
                            <td className="py-3 px-2 text-left">
                              {item.officialPercentage?.toFixed(2)}%
                            </td>
                            <td
                              className={`py-3 px-2 text-left ${
                                item.attendancePercentage < 85
                                  ? "text-red-500"
                                  : "text-black"
                              }`}
                            >
                              {item.attendancePercentage.toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAttendance;
