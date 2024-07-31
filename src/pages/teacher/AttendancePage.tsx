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
    <div className="min-h-screen py-8">
      {loading ? (
        <Loading />
      ) : (
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-gray-900 p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-300 mb-4">
              <span className="text-gray-400">Subject:</span>{" "}
              {subject?.name || "Loading..."}
            </h1>
            <h2 className="text-2xl font-semibold text-blue-900 mb-6">
              <span className="text-gray-400">Class:</span>{" "}
              {subject?.class?.name || ""}
            </h2>
          </div>
          <div className="flex lg:space-x-3 space-x-1">
            <Link to={`/subject-attendance/${subject?._id}`}>
              <button className="my-3 lg:w-full w-sm  bg-gray-200 text-gray-900 px-3 py-2 rounded-full flex items-center text-sm">
                <Download className="mr-2" /> <p>Attendance Report </p>
              </button>
            </Link>
            <Link to={`/edit-attendance/${subject?._id}`}>
              <button className="my-3 lg:w-full w-sm bg-gray-200 text-gray-900 px-3 py-2 rounded-full flex items-center text-sm">
                <Pen className="mr-2" /> <p>Edit Attendance</p>
              </button>
            </Link>
          </div>
          {attendancesData.length > 0 &&
          attendances[0]?.subject?.toString() === subjectId ? (
            <>
              <MarkedAttendaces attendances={attendancesData} />
              <div className="lg:flex items-center justify-start mt-3 space-x-3">
                <Link to={`/edit-attendance/${subjectId}`}>
                  <div className="flex items-center rounded-full max-w-xl bg-teal-700 p-3 text-white ">
                    <PenIcon size={20} />
                    <h1 className="text-center ml-2">Edit Attendance</h1>
                  </div>
                </Link>
              </div>
            </>
          ) : (
            <>
              <AttendanceList
                students={subject?.students || []}
                attendances={attendances}
                handleAttendanceChange={handleAttendanceChange}
                handleReasonChange={handleReasonChange}
              />
              <div className="mt-8 flex justify-end">
                <div className="flex items-center mr-4">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Present: {presentCount}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span>Absent: {absentCount}</span>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                className="mt-8 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 ml-4"
              >
                Submit Attendance
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AttendancePage;
