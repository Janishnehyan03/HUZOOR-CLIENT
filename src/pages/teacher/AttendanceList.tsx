import { MoreVertical } from "lucide-react";
import React, { useState } from "react";
import { Attendance } from "../../lib/types";

interface AttendanceListProps {
  students: any[];
  attendances: Attendance[];
  handleAttendanceChange: (studentId: string, isPresent: boolean) => void;
  handleReasonChange: (studentId: string, reason: string | null) => void;
}

const AttendanceList: React.FC<AttendanceListProps> = ({
  students,
  attendances,
  handleAttendanceChange,
  handleReasonChange,
}) => {
  const [showDropdown, setShowDropdown] = useState<Record<string, boolean>>({});

  const toggleDropdown = (studentId: string) => {
    setShowDropdown((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };
  

  const handleReasonSelect = (studentId: string, reason: string | null) => {
    handleReasonChange(studentId, reason);
    setShowDropdown((prev) => ({
      ...prev,
      [studentId]: false,
    }));
  };

  return (
    <>
      <div className="flex space-x-3 mx-auto w-1/2">
        <div>
          <div className="flex items-center space-x-3">
            <p>Present</p>
            <div className="h-3 w-8 bg-teal-600" />
          </div>
          <div className="flex items-center space-x-3">
            <p>Absent</p>
            <div className="h-3 w-8 bg-red-200" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-3">
            <p>Official</p>
            <div className="h-3 w-8 bg-gray-400" />
          </div>
          <div className="flex items-center space-x-3">
            <p>Medical</p>
            <div className="h-3 w-8 bg-green-300" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2  gap-4 mt-4 mx-3 px-3">
        {students.map((student, index) => {
          const attendance = attendances.find(
            (attendance) =>
              attendance.student.toString() === student._id.toString()
          );
          const isPresent = attendance?.isPresent;
          const reason = attendance?.reason;

          return (
            <div
              key={student._id}
              className={`relative rounded-lg shadow-md flex items-center justify-between ${
                isPresent
                  ? reason === "official"
                    ? "border-b-gray-400 border-b-8 hover:border-b-gray-300" // Gray for official when present
                    : "border-b-teal-600 border-b-8 text-teal-600" // Transparent background if present for other reasons
                  : !reason
                  ? "border-b-red-600 border-b-8 text-red-600" // Red for absent without reason
                  : reason === "medical"
                  ? "border-b-green-300 border-b-8 hover:border-b-green-300" // Green for medical
                  : "border-b-green-200 border-b-8 hover:border-b-green-300" // Default green for other reasons
              }`}
            >
              <div className="flex items-center w-full h-full px-4 py-2">
                <input
                  type="checkbox"
                  checked={isPresent}
                  onChange={(e) =>
                    handleAttendanceChange(
                      student._id.toString(),
                      e.target.checked
                    )
                  }
                  className="form-checkbox text-green-500 focus:ring-green-400"
                />
                <div className="flex w-full items-center justify-between space-y-1">
                  <p className="font-sans ml-2 uppercase">
                    {index + 1}. {student.name}
                  </p>
                  <div className="">
                    <button onClick={() => toggleDropdown(student._id)}>
                      <MoreVertical />
                    </button>
                    <p className="text-xs text-gray-600">
                      {student?.class?.name}
                    </p>
                    {showDropdown[student._id] && (
                      <div className="absolute right-0 mt-2 z-40 w-48 bg-white border border-gray-200 rounded shadow-lg">
                        <button
                          onClick={() =>
                            handleReasonSelect(student._id, "official")
                          }
                          className={`block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200 ${
                            reason === "official" ? "bg-gray-200" : ""
                          }`}
                        >
                          Official
                        </button>
                        <button
                          onClick={() =>
                            handleReasonSelect(student._id, "medical")
                          }
                          className={`block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200 ${
                            reason === "medical" ? "bg-gray-200" : ""
                          }`}
                        >
                          Medical
                        </button>
                        <button
                          onClick={() => handleReasonSelect(student._id, null)}
                          className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                        >
                          Remove Reason
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default AttendanceList;
