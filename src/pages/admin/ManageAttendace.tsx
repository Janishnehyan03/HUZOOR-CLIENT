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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    {/* Header */}
    <div className="max-w-7xl mx-auto text-center mb-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Attendance Management</h1>
      <p className="text-lg text-gray-600">Monitor and manage student attendance records</p>
    </div>
  
    {/* Dashboard Cards */}
    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      {[
        {
          title: "Students",
          icon: <User className="w-10 h-10 text-white" />,
          to: "/manage-attendance/students",
          button: "View Students",
          bgColor: "bg-indigo-600"
        },
        {
          title: "Departments",
          icon: <GraduationCap className="w-10 h-10 text-white" />,
          to: "/manage-attendance/departments",
          button: "View Departments",
          bgColor: "bg-blue-600"
        },
        {
          title: "Subjects",
          icon: <BookOpen className="w-10 h-10 text-white" />,
          to: "/manage-attendance/subjects",
          button: "View Subjects",
          bgColor: "bg-emerald-600"
        },
        {
          title: "Attendance Clearance",
          icon: <CheckCheck className="w-10 h-10 text-white" />,
          to: "/manage-attendance/attendance-clearance",
          button: "Go To Clearance",
          bgColor: "bg-purple-600"
        },
      ].map(({ title, icon, to, button, bgColor }, idx) => (
        <Link to={to} key={idx} className="group">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-300 h-full flex flex-col">
            <div className={`${bgColor} p-5 flex justify-center`}>
              <div className="rounded-lg p-3 bg-white/10 backdrop-blur-sm">
                {icon}
              </div>
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <button className="mt-auto w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
                {button}
              </button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  
    {/* Below Threshold Section */}
    <div className="max-w-7xl mx-auto mb-16">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Low Attendance Students</h2>
              <p className="text-gray-600">Students with attendance below 85% threshold</p>
            </div>
            <div className="mt-4 md:mt-0 w-full md:w-64">
              <label htmlFor="class-select" className="sr-only">Select Class</label>
              <select
                id="class-select"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Results would be displayed here */}
        </div>
      </div>
    </div>
  
    {/* Attendance Statistics */}
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Attendance Statistics</h2>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loading />
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {Object.entries(groupedStatistics).map(([subject, students]: any) => (
              <div key={subject} className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adm. No</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medical</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Official</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((item: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.studentName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.admissionNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.totalAttendanceCount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.totalPresentCount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.medicalPercentage?.toFixed(2)}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.officialPercentage?.toFixed(2)}%</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                            item.attendancePercentage < 85 ? "text-red-600" : "text-green-600"
                          }`}>
                            {item.attendancePercentage.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default ManageAttendance;
