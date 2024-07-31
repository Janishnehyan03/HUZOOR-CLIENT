import React from "react";

interface MarkedAttendacesProps {
  attendances: any[];
}

const MarkedAttendaces: React.FC<MarkedAttendacesProps> = ({ attendances }) => {
  
  return (
    <div className="lg:grid grid-cols-3 ">
      {attendances?.map((attendance) => (
        <div
          key={attendance?.student?._id}
          className={`relative rounded-lg p-2 shadow-md bg-gray-50 border flex items-center lg:m-1 m-2 justify-between ${
            attendance?.isPresent
              ? attendance?.student?.reason === "official"
                ? "border-b-gray-400 border-b-8 hover:border-b-gray-300" // Gray for official when present
                : "border-b-teal-600 border-b-8 text-teal-600" // Transparent background if present for otherattendance?.student?. reasons
              : !attendance?.student?.reason
              ? "border-b-red-600 border-b-8 text-red-600" // Red for absent withoutattendance?.student?. reason
              : attendance?.student?.reason === "medical"
              ? "border-b-green-300 border-b-8 hover:border-b-green-300" // Green for medical
              : "border-b-green-200 border-b-8 hover:border-b-green-300" // Default green for other reasons
          }`}
        >
          <p className="font-bold">{attendance?.student?.name}</p>
          <span className="text-xs text-gray-900 float-end">{attendance.student.class.name}</span>
          <span className="text-xs italic text-gray-500">{attendance.reason}</span>
        </div>
      ))}
    </div>
  );
};

export default MarkedAttendaces;
