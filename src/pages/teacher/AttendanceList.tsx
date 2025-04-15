import { Briefcase, MoreVertical, PlusCircle, XCircle } from "lucide-react";
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
      {/* Status Legend - Modern Card Style */}
      <div className="bg-white p-4 rounded-lg shadow-xs border border-gray-100 mb-6 mx-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Attendance Status
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-teal-500"></div>
            <span className="text-sm text-gray-700">Present</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-red-400"></div>
            <span className="text-sm text-gray-700">Absent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-gray-400"></div>
            <span className="text-sm text-gray-700">Official Duty</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-400"></div>
            <span className="text-sm text-gray-700">Medical Leave</span>
          </div>
        </div>
      </div>

      {/* Student Cards - Enhanced Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4">
        {students.map((student, index) => {
          const attendance = attendances.find(
            (a) => a.student.toString() === student._id.toString()
          );
          const isPresent = attendance?.isPresent;
          const reason = attendance?.reason;

          // Status configuration
          const statusConfig = {
            present: {
              bg: "bg-teal-50",
              border: "border-teal-500",
              text: "text-teal-800",
            },
            absent: {
              bg: "bg-red-50",
              border: "border-red-400",
              text: "text-red-800",
            },
            official: {
              bg: "bg-gray-50",
              border: "border-gray-400",
              text: "text-gray-800",
            },
            medical: {
              bg: "bg-green-50",
              border: "border-green-400",
              text: "text-green-800",
            },
          };

          let config = statusConfig.present;
          if (!isPresent) {
            config =
              reason === "medical"
                ? statusConfig.medical
                : reason === "official"
                ? statusConfig.official
                : statusConfig.absent;
          } else if (reason === "official") {
            config = statusConfig.official;
          }

          return (
            <div
              key={student._id}
              className={`${config.bg} rounded-lg border-l-4 ${config.border} p-4 transition-all hover:shadow-xs`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={isPresent}
                    onChange={(e) =>
                      handleAttendanceChange(student._id, e.target.checked)
                    }
                    className={`h-4 w-4 rounded ${
                      config.text
                    } border-gray-300 focus:ring-2 focus:ring-offset-0 ${config.border.replace(
                      "border",
                      "focus:ring"
                    )}`}
                  />

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      <span className="text-gray-500">{index + 1}.</span>{" "}
                      {student.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {student.class?.name}
                    </p>
                  </div>
                </div>

                {/* Action Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown(student._id)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full focus:outline-none"
                    aria-label="Attendance options"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {showDropdown[student._id] && (
                    <div className="absolute right-0 mt-1 z-10 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
                      <div className="py-1">
                        <button
                          onClick={() =>
                            handleReasonSelect(student._id, "official")
                          }
                          className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                            reason === "official"
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <Briefcase size={14} className="mr-2" />
                          Official Duty
                        </button>
                        <button
                          onClick={() =>
                            handleReasonSelect(student._id, "medical")
                          }
                          className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                            reason === "medical"
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <PlusCircle size={14} className="mr-2" />
                          Medical Leave
                        </button>
                        <button
                          onClick={() => handleReasonSelect(student._id, null)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <XCircle size={14} className="mr-2" />
                          Clear Reason
                        </button>
                      </div>
                    </div>
                  )}
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
