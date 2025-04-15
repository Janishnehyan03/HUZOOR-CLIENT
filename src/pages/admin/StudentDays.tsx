import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "../../Axios";
import Loading from "../../components/Loading";

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
    <div className="max-w-7xl mx-auto p-6">
      {error && (
        <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
      )}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{student?.name}</h1>
        <h3 className="text-lg text-gray-500">{student?.admissionNumber}</h3>
      </div>

      {attendanceDetails?.student && (
        <div className="bg-white shadow-sm rounded-2xl p-6 mb-6 border">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Student Information
          </h2>
          <div className="space-y-1 text-gray-600 text-sm">
            <p>
              <span className="font-medium text-gray-700">Name:</span>{" "}
              {attendanceDetails.student.name}
            </p>
            <p>
              <span className="font-medium text-gray-700">Admission No:</span>{" "}
              {attendanceDetails.student.admissionNumber}
            </p>
            <p>
              <span className="font-medium text-gray-700">Class:</span>{" "}
              {attendanceDetails.student.class}
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {attendanceDetails?.statistics.map(
          (subject: Subject, index: number) => (
            <div
              key={index}
              className="bg-white border p-5 rounded-2xl shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {subject.subjectName}
              </h3>

              {Object.entries(groupByMonth(subject.attendanceRecords)).map(
                ([month, records]) => (
                  <div key={month} className="mb-5">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">
                      {month}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(records as AttendanceRecord[]).map((record, i) => {
                        const isPresent = record.status === "Present";
                        const bgColor = isPresent
                          ? "bg-green-500"
                          : "bg-red-500";
                        return (
                          <div
                            key={i}
                            className={`w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-medium ${bgColor}`}
                          >
                            {dayjs(record.date).date()}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}

              <div className="text-sm text-gray-600 mt-4 space-y-1">
                <p>
                  <span className="font-medium text-gray-700">
                    Total Attendance:
                  </span>{" "}
                  {subject.attendanceRecords.length}
                </p>
                <p>
                  <span className="font-medium text-gray-700">
                    Total Present:
                  </span>{" "}
                  {
                    subject.attendanceRecords.filter(
                      (r) => r.status === "Present"
                    ).length
                  }
                </p>
                <p>
                  <span className="font-medium text-gray-700">
                    Total Absent:
                  </span>{" "}
                  {
                    subject.attendanceRecords.filter(
                      (r) => r.status === "Absent"
                    ).length
                  }
                </p>
                <p>
                  <span className="font-medium text-gray-700">Percentage:</span>{" "}
                  {(
                    (subject.attendanceRecords.filter(
                      (r) => r.status === "Present"
                    ).length /
                      subject.attendanceRecords.length) *
                    100
                  ).toFixed(2)}
                  %
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default StudentDays;
