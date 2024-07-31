import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Axios from "../../Axios";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import toast from "react-hot-toast";
import { MoreVertical } from "lucide-react";

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
}

interface Attendance {
  _id: string;
  isPresent: boolean;
  student: Student;
  date: string;
  subject: string;
  reason: string | null;
}

const EditAttendance: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const { subjectId } = useParams<{ subjectId: string }>();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [selectedDate, subjectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await Axios.get(
        `/attendance/subject/${subjectId}/date/${
          selectedDate.toISOString().split("T")[0]
        }`
      );

      if (response.data.length > 0) {        
        setAttendances(response.data);
      } else {
        getSubject();
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching attendance data:", error);
    }
  };
  const getSubject = async () => {
    setLoading(true);
    try {
      const { data } = await Axios.get(`/subject/${subjectId}`);
      setLoading(false);

      const initialAttendances = data.subject.students.map(
        (student: Student) => ({
          subject: subjectId,
          student: {
            name: student.name,
            _id: student._id,
          },
          isPresent: true,
        })
      );

      setAttendances(initialAttendances);
    } catch (error: any) {
      setLoading(false);
      console.log(error.response);
    }
  };

  const handleAttendanceChange = (
    studentId: string,
    isPresent: boolean,
    subject: string
  ) => {
    setAttendances((prevAttendances) =>
      prevAttendances.map((attendance) =>
        attendance.student._id === studentId
          ? { ...attendance, isPresent, subject }
          : attendance
      )
    );
  };

  const toggleDropdown = (studentId: string) => {
    setShowDropdown((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleReasonChange = async (
    studentId: string,
    reason: string | null
  ) => {
    setAttendances((prevAttendances) =>
      prevAttendances.map((attendance) =>
        attendance.student._id === studentId
          ? {
              ...attendance,
              reason,
              isPresent: reason !== "medical",
            }
          : attendance
      )
    );
  };

  const handleReasonSelect = (studentId: string, reason: string | null) => {
    handleReasonChange(studentId, reason);
    setShowDropdown((prev) => ({
      ...prev,
      [studentId]: false,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await Axios.post("/attendance", attendances);
      setIsSubmitting(false);
      toast.success("Edited Successfully");
      navigate("/");
    } catch (error: any) {
      setIsSubmitting(false);
      toast.error("Something went wrong");
      console.error("Error updating attendance:", error.response);
    }
  };

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="flex flex-col items-center justify-center mt-3">
            <div className="mb-4">
              <label htmlFor="date" className="mr-2 text-lg font-bold">
                Select Date:
              </label>
              <DatePicker
                id="date"
                selected={selectedDate}
                onChange={(date: Date) => setSelectedDate(date)}
                className="px-2 py-1 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {attendances.map((attendance, index: number) => (
                <div
                  key={attendance.student._id}
                  className={`relative rounded-lg p-3 shadow-md flex items-center justify-between ${
                    attendance.isPresent
                      ? attendance.reason === "official"
                        ? "bg-gray-400 hover:bg-gray-300" // Gray for official when present
                        : "bg-teal-600 text-white" // Transparent background if present for otherattendance. reasons
                      : !attendance.reason
                      ? "bg-red-200 hover:bg-red-300" // Red for absent withoutattendance. reason
                      : attendance.reason === "medical"
                      ? "bg-green-300 hover:bg-green-300" // Green for medical
                      : "bg-green-200 hover:bg-green-300" // Default green for other reasons
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={attendance.isPresent}
                    onChange={(e) =>
                      handleAttendanceChange(
                        attendance.student._id,
                        e.target.checked,
                        subjectId || ""
                      )
                    }
                    className="form-checkbox text-gray-500"
                  />
                  <span className="text-lg font-semibold">
                    {index + 1} {attendance.student.name}
                  </span>
                  <button
                    onClick={() => toggleDropdown(attendance.student._id)}
                  >
                    <MoreVertical />
                  </button>
                  {showDropdown[attendance.student._id] && (
                    <div className="absolute right-0 mt-2 z-40 w-48 bg-white border border-gray-200 rounded shadow-lg">
                      <button
                        onClick={() =>
                          handleReasonSelect(attendance.student._id, "official")
                        }
                        className={`block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200 ${
                          attendance.reason === "official" ? "bg-gray-200" : ""
                        }`}
                      >
                        Official
                      </button>
                      <button
                        onClick={() =>
                          handleReasonSelect(attendance.student._id, "medical")
                        }
                        className={`block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200 ${
                          attendance.reason === "medical" ? "bg-gray-200" : ""
                        }`}
                      >
                        Medical
                      </button>
                      <button
                        onClick={() =>
                          handleReasonSelect(attendance.student._id, null)
                        }
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                      >
                        Remove Reason
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {isSubmitting ? (
              <button className="mt-4 px-4 py-2 mb-4 bg-gray-500 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500">
                Submitting...
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="mt-4 px-4 py-2 mb-4 bg-gray-500 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Submit Attendance
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EditAttendance;
