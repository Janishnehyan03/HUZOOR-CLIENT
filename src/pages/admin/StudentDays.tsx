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
    <div className="container mx-auto p-4">
      {error && <p className="text-red-500 mt-4">{error}</p>}
      <div className="text-center">
        <h1 className=" font-semibold text-gray-700 text-3xl">
          {student?.name}
        </h1>
        <h3 className=" text-gray-700 text-xl">{student?.admissionNumber}</h3>
      </div>
      <div className="mt-8">
        {attendanceDetails && attendanceDetails.student && (
          <div className="border p-4 mb-4">
            <h2 className="text-2xl font-bold mb-4">Student Information</h2>
            <p>
              <strong>Student Name:</strong> {attendanceDetails.student.name}
            </p>
            <p>
              <strong>Admission Number:</strong>{" "}
              {attendanceDetails.student.admissionNumber}
            </p>
            <p>
              <strong>Class:</strong> {attendanceDetails.student.class}
            </p>
          </div>
        )}

        <div>
          <div className="lg:grid lg:grid-cols-2 gap-2">
            {attendanceDetails?.statistics.map(
              (subject: Subject, index: number) => (
                <div key={index} className="border bg-gray-50 p-4 rounded-3xl">
                  <h3 className="text-lg font-bold mb-2">
                    {subject.subjectName}
                  </h3>
                  {Object.entries(groupByMonth(subject.attendanceRecords)).map(
                    ([month, records]) => (
                      <div key={month} className="mb-4">
                        <h4 className="text-md font-semibold mb-2">{month}</h4>
                        <div className="flex flex-wrap">
                          {(records as AttendanceRecord[]).map(
                            (record: AttendanceRecord, i: number) => {
                              const bgColor =
                                record.status === "Present"
                                  ? "bg-green-500"
                                  : "bg-red-500";
                              return (
                                <div
                                  key={i}
                                  className={`w-8 h-8 flex items-center justify-center m-1 ${bgColor} text-white`}
                                >
                                  {dayjs(record.date).date()}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )
                  )}

                  <div className="mt-2">
                    <p>
                      <strong>Total Attendance:</strong>{" "}
                      {subject.attendanceRecords.length}
                    </p>
                    <p>
                      <strong>Total Present:</strong>{" "}
                      {
                        subject.attendanceRecords.filter(
                          (record: any) => record.status === "Present"
                        ).length
                      }
                    </p>
                    <p>
                      <strong>Total Absent:</strong>{" "}
                      {
                        subject.attendanceRecords.filter(
                          (record: any) => record.status === "Absent"
                        ).length
                      }
                    </p>
                    <p>
                      <strong>Attendance Percentage:</strong>{" "}
                      {(
                        (subject.attendanceRecords.filter(
                          (record: any) => record.status === "Present"
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
      </div>
    </div>
  );
};

export default StudentDays;
