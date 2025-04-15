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
    <div className="max-w-7xl mx-auto px-4 py-6">
    {loading ? (
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    ) : (
      <div className="space-y-6">
        {/* Date Picker */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-white p-4 rounded-xl shadow-sm">
          <label htmlFor="date" className="text-sm font-medium text-gray-700">
            Select Date:
          </label>
          <DatePicker
            id="date"
            selected={selectedDate}
            onChange={(date: Date) => setSelectedDate(date)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            dateFormat="MMMM d, yyyy"
          />
        </div>
  
        {/* Attendance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {attendances.map((attendance, ) => {
            const statusConfig = attendance.isPresent
              ? attendance.reason === "official"
                ? { text: "On Duty", bg: "bg-gray-100", textColor: "text-gray-800", border: "border-gray-200" }
                : { text: "Present", bg: "bg-teal-50", textColor: "text-teal-800", border: "border-teal-100" }
              : !attendance.reason
              ? { text: "Absent", bg: "bg-red-50", textColor: "text-red-800", border: "border-red-100" }
              : attendance.reason === "medical"
              ? { text: "Medical", bg: "bg-green-50", textColor: "text-green-800", border: "border-green-100" }
              : { text: "Leave", bg: "bg-blue-50", textColor: "text-blue-800", border: "border-blue-100" };
  
            return (
              <div
                key={attendance.student._id}
                className={`relative p-4 rounded-xl border ${statusConfig.bg} ${statusConfig.border} hover:shadow-md transition-all`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
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
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attendance.student.name}
                      </p>
                 
                    </div>
                  </div>
  
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.bg.replace('50', '100')} ${statusConfig.textColor}`}>
                      {statusConfig.text}
                    </span>
                    <button
                      onClick={() => toggleDropdown(attendance.student._id)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      aria-label="More options"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
  
                {/* Dropdown Menu */}
                {showDropdown[attendance.student._id] && (
                  <div className="absolute right-0 mt-1 z-10 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
                    <div className="py-1">
                      <button
                        onClick={() => handleReasonSelect(attendance.student._id, "official")}
                        className={`w-full text-left px-4 py-2 text-sm ${attendance.reason === "official" ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        Official Duty
                      </button>
                      <button
                        onClick={() => handleReasonSelect(attendance.student._id, "medical")}
                        className={`w-full text-left px-4 py-2 text-sm ${attendance.reason === "medical" ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        Medical Leave
                      </button>
                      <button
                        onClick={() => handleReasonSelect(attendance.student._id, null)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Clear Reason
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
  
        {/* Submit Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              "Submit Attendance"
            )}
          </button>
        </div>
      </div>
    )}
  </div>
  );
};

export default EditAttendance;
