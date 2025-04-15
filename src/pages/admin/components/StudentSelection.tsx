import React, { useEffect, useState } from "react";
import Axios from "../../../Axios";
import { UserRound, Users } from "lucide-react";

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
}

interface Class {
  _id: string;
  name: string;
}

interface Props {
  onSelect: (studentId: string) => void;
}

const StudentSelect: React.FC<Props> = ({ onSelect }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await Axios.get("/class"); // Replace with your API endpoint
        setClasses(response.data.classes);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedClass) {
        try {
          const response = await Axios.get(
            `/student?class=${selectedClass}&sort=rollNumber`
          ); // Replace with your API endpoint
          setStudents(response.data.students);
        } catch (error) {
          console.error("Error fetching students:", error);
        }
      }
    };

    fetchStudents();
  }, [selectedClass]);

  const handleClassChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(event.target.value);
    setStudents([]);
    setSelectedStudent("");
  };

  const handleStudentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const studentId = event.target.value;
    setSelectedStudent(studentId);
    onSelect(studentId);
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6 w-full max-w-xl mx-auto">
      {/* Select Class */}
      <label
        htmlFor="classSelect"
        className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"
      >
        <Users className="w-5 h-5 text-teal-600" />
        Select Class
      </label>
      <select
        id="classSelect"
        value={selectedClass}
        onChange={handleClassChange}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm transition mb-4"
      >
        <option value="">-- Select a Class --</option>
        {classes.map((classItem) => (
          <option key={classItem._id} value={classItem._id}>
            {classItem.name}
          </option>
        ))}
      </select>

      {/* Select Student (only when class is selected) */}
      {selectedClass && (
        <>
          <label
            htmlFor="studentSelect"
            className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"
          >
            <UserRound className="w-5 h-5 text-violet-600" />
            Select Student
          </label>
          <select
            id="studentSelect"
            value={selectedStudent}
            onChange={handleStudentChange}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm transition"
          >
            <option value="">-- Select a Student --</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student?.rollNumber} {student.name}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
};

export default StudentSelect;
