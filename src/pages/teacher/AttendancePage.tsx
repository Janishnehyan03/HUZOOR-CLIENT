// AttendancePage.tsx
import { Download, Pen, PenIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import Axios from "../../Axios";
import Loading from "../../components/Loading";
import { Attendance, Student, Subject } from "../../lib/types";
import AttendanceList from "./AttendanceList";
import MarkedAttendaces from "./MarkedAttendaces";

function AttendancePage() {
  const { subjectId } = useParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [attendancesData, setAttendancesData] = useState<Attendance[]>([]);

  const getAttendances = async () => {
    setLoading(true);
    try {
      let { data } = await Axios.get(`/attendance/subject/${subjectId}`);
      setLoading(false);
      setAttendancesData(data);
    } catch (error: any) {
      setLoading(false);
      console.log(error.response);
    }
  };

  const getSubject = async () => {
    setLoading(true);
    try {
      const { data } = await Axios.get(`/subject/${subjectId}`);
      setLoading(false);
      setSubject(data.subject);
      const initialAttendances = data.subject.students.map(
        (student: Student) => ({
          subject: subjectId,
          student: student._id,
          isPresent: true,
        })
      );
      setAttendances(initialAttendances);
    } catch (error: any) {
      setLoading(false);
      console.log(error.response);
    }
  };
  const handleAttendanceChange = async (
    studentId: string,
    isPresent: boolean
  ) => {
    try {
      // Update state
      setAttendances((prevAttendances) =>
        prevAttendances.map((attendance) =>
          attendance.student.toString() === studentId
            ? { ...attendance, isPresent }
            : attendance
        )
      );
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  const handleReasonChange = async (
    studentId: string,
    reason: string | null
  ) => {
    // Update state
    setAttendances((prevAttendances) =>
      prevAttendances.map((attendance) =>
        attendance.student.toString() === studentId
          ? {
              ...attendance,
              reason,
              isPresent: reason !== "medical",
            }
          : attendance
      )
    );
  };

  const handleSubmit = async () => {
    if (window.confirm("Are you sure to submit the attendance")) {
      try {
        await Axios.post("/attendance", attendances);
        toast.success("Attendance submitted");
        navigate("/");
      } catch (error: any) {
        console.log(error.response);
        toast.error("Something went wrong");
      }
    }
  };

  const presentCount = attendances.filter(
    (attendance) => attendance.isPresent
  ).length;
  const absentCount = attendances.filter(
    (attendance) => !attendance.isPresent
  ).length;

  useEffect(() => {
    getSubject();
    getAttendances();
  }, [subjectId]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Subject Header Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-800 to-blue-600">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                <span className="text-blue-200">Subject:</span>{" "}
                {subject?.name || "Loading..."}
              </h1>
              <h2 className="text-xl sm:text-2xl font-medium text-blue-100">
                <span className="text-blue-200">Class:</span>{" "}
                {subject?.class?.name || ""}
              </h2>
            </div>

            {/* Action Buttons */}
            <div className="p-4 sm:p-6 flex flex-wrap gap-3">
              <Link
                to={`/subject-attendance/${subject?._id}`}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                <Download className="w-4 h-4 mr-2" />
                Attendance Report
              </Link>
              <Link
                to={`/edit-attendance/${subject?._id}`}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                <Pen className="w-4 h-4 mr-2" />
                Edit Attendance
              </Link>
            </div>
          </div>

          {/* Attendance Content */}
          {attendancesData.length > 0 &&
          attendances[0]?.subject?.toString() === subjectId ? (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Marked Attendances
              </h3>
              <MarkedAttendaces attendances={attendancesData} />
              </div>
              <div className="flex justify-end">
              <Link
                to={`/edit-attendance/${subjectId}`}
                className="inline-flex items-center px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PenIcon className="w-5 h-5 mr-2" />
                Edit Attendance
              </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <AttendanceList
                students={subject?.students || []}
                attendances={attendances}
                handleAttendanceChange={handleAttendanceChange}
                handleReasonChange={handleReasonChange}
              />

              {/* Summary and Submit */}
              <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
                <div className="flex space-x-6 mb-4 sm:mb-0">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm font-medium">
                      Present: {presentCount}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm font-medium">
                      Absent: {absentCount}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Submit Attendance
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AttendancePage;
