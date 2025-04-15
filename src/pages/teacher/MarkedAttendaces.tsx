import React from "react";

interface MarkedAttendacesProps {
  attendances: any[];
}

const MarkedAttendaces: React.FC<MarkedAttendacesProps> = ({ attendances }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {attendances?.map((attendance) => {
        // Determine status and styling based on attendance
        let status = "";
        let statusClass = "";

        if (attendance?.isPresent) {
          if (attendance?.student?.reason === "official") {
            status = "Official Duty";
            statusClass = "bg-gray-100 text-gray-800 border-gray-300";
          } else {
            status = "Present";
            statusClass = "bg-teal-50 text-teal-800 border-teal-200";
          }
        } else {
          if (!attendance?.student?.reason) {
            status = "Absent";
            statusClass = "bg-red-50 text-red-800 border-red-200";
          } else if (attendance?.student?.reason === "medical") {
            status = "Medical Leave";
            statusClass = "bg-green-50 text-green-800 border-green-200";
          } else {
            status = "Leave";
            statusClass = "bg-blue-50 text-blue-800 border-blue-200";
          }
        }

        return (
          <div
            key={attendance?.student?._id}
            className={`rounded-lg p-4 shadow-sm border ${statusClass} transition-all hover:shadow-md hover:-translate-y-0.5`}
          >
            <div className="flex justify-between items-start mb-2">
              <p className="font-semibold text-gray-900 truncate">
                {attendance?.student?.name}
              </p>
              <span className="px-2 py-1 text-xs font-medium rounded-full ${statusClass.replace('50', '100')}">
                {status}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">
                {attendance.student.class.name}
              </span>
              {attendance.reason && (
                <span className="text-xs text-gray-500 italic truncate max-w-[120px]">
                  {attendance.reason}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MarkedAttendaces;
