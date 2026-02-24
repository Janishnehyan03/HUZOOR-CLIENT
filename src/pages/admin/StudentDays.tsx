import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "../../Axios";
import Loading from "../../components/Loading";
import {
  User,
  CreditCard,
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

type AttendanceRecord = {
  date: string;
  status: string;
};

type Subject = {
  subjectName: string;
  attendanceRecords: AttendanceRecord[];
};

type Student = {
  name: string;
  admissionNumber: string;
  class: string;
};

type AttendanceDetails = {
  student: Student;
  statistics: Subject[];
};

const StudentDays = () => {
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<Student>();
  const [attendanceDetails, setAttendanceDetails] =
    useState<AttendanceDetails | null>(null);
  const [error, setError] = useState<string>("");
  const { studentId } = useParams<{ studentId: string }>();

  const fetchData = async () => {
    try {
      setLoading(true);
      const attendanceResponse = await Axios.get(
        `/attendance/get/absences?student=${studentId}`
      );
      setAttendanceDetails(attendanceResponse.data);
      setLoading(false);
      setError("");
    } catch (err: any) {
      setLoading(false);
      setError(err.response.data.message || "An error occurred");
    }
  };
  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await Axios.get(`/student/${studentId}`);
      setStudent(response.data);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      console.log(err.response);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchStudent();
      fetchData();
    }
  }, [studentId]);

  const groupByMonth = (records: AttendanceRecord[]) => {
    return records.reduce((acc: any, record: AttendanceRecord) => {
      const month = dayjs(record.date).format("MMMM YYYY");
      if (!acc[month]) acc[month] = [];
      acc[month].push(record);
      return acc;
    }, {});
  };

  if (loading) {
    return <Loading />;
  }
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-50">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Hero Header - Student Profile */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 p-8 mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-slate-100/[0.02] [mask-image:radial-gradient(white,transparent_85%)]" />
        <div className="relative">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-violet-500/20 rounded-2xl backdrop-blur-sm border border-violet-400/20">
              <User className="w-10 h-10 text-violet-300" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {student?.name || "Student Details"}
              </h1>
              <p className="text-violet-200 text-lg">
                {student?.admissionNumber || "Loading..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Information Card */}
      {attendanceDetails?.student && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <CreditCard className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">
              Student Information
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Full Name
                </span>
              </div>
              <p className="text-slate-900 font-semibold text-lg">
                {attendanceDetails.student.name}
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Admission No
                </span>
              </div>
              <p className="text-slate-900 font-semibold text-lg">
                {attendanceDetails.student.admissionNumber}
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Class
                </span>
              </div>
              <p className="text-slate-900 font-semibold text-lg">
                {attendanceDetails.student.class}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subject Attendance Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {attendanceDetails?.statistics.map(
          (subject: Subject, index: number) => {
            const totalPresent = subject.attendanceRecords.filter(
              (r) => r.status === "Present"
            ).length;
            const totalAbsent = subject.attendanceRecords.filter(
              (r) => r.status === "Absent"
            ).length;
            const percentage =
              (totalPresent / subject.attendanceRecords.length) * 100;
            const isLowAttendance = percentage < 85;

            return (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Subject Header */}
                <div
                  className={`p-5 ${
                    isLowAttendance
                      ? "bg-gradient-to-r from-red-500 to-rose-500"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      {subject.subjectName}
                    </h3>
                    <div
                      className={`px-4 py-1 rounded-full text-sm font-bold ${
                        isLowAttendance
                          ? "bg-white/20 text-white"
                          : "bg-white/20 text-white"
                      }`}
                    >
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  {/* Monthly Calendar Grid */}
                  {Object.entries(groupByMonth(subject.attendanceRecords)).map(
                    ([month, records]) => (
                      <div key={month} className="mb-6 last:mb-0">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                            {month}
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(records as AttendanceRecord[]).map((record, i) => {
                            const isPresent = record.status === "Present";
                            return (
                              <div
                                key={i}
                                className={`relative group w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm transition-all hover:scale-110 ${
                                  isPresent
                                    ? "bg-emerald-500 hover:bg-emerald-600"
                                    : "bg-red-500 hover:bg-red-600"
                                }`}
                                title={`${dayjs(record.date).format(
                                  "MMM DD, YYYY"
                                )} - ${record.status}`}
                              >
                                {dayjs(record.date).date()}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}

                  {/* Statistics Summary */}
                  <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-slate-200">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-medium text-slate-500">
                          Total Days
                        </span>
                      </div>
                      <p className="text-xl font-bold text-slate-900">
                        {subject.attendanceRecords.length}
                      </p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">
                          Present
                        </span>
                      </div>
                      <p className="text-xl font-bold text-emerald-700">
                        {totalPresent}
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-medium text-red-700">
                          Absent
                        </span>
                      </div>
                      <p className="text-xl font-bold text-red-700">
                        {totalAbsent}
                      </p>
                    </div>
                    <div
                      className={`${
                        isLowAttendance ? "bg-red-50" : "bg-emerald-50"
                      } rounded-xl p-3`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp
                          className={`w-4 h-4 ${
                            isLowAttendance
                              ? "text-red-600"
                              : "text-emerald-600"
                          }`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            isLowAttendance
                              ? "text-red-700"
                              : "text-emerald-700"
                          }`}
                        >
                          Percentage
                        </span>
                      </div>
                      <p
                        className={`text-xl font-bold ${
                          isLowAttendance ? "text-red-700" : "text-emerald-700"
                        }`}
                      >
                        {percentage.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default StudentDays;
