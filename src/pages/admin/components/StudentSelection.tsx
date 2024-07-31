import React, { useEffect, useState } from "react";
import Axios from "../../../Axios";

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
    <div className="mb-4">
      <label
        htmlFor="classSelect"
        className="block text-gray-700 font-bold mb-2"
      >
        Select Class:
      </label>
      <select
        id="classSelect"
        value={selectedClass}
        onChange={handleClassChange}
        className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline mb-4"
      >
        <option value="">-- Select a Class --</option>
        {classes.map((classItem) => (
          <option key={classItem._id} value={classItem._id}>
            {classItem.name}
          </option>
        ))}
      </select>

      {selectedClass && (
        <>
          <label
            htmlFor="studentSelect"
            className="block text-gray-700 font-bold mb-2"
          >
            Select Student:
          </label>
          <select
            id="studentSelect"
            value={selectedStudent}
            onChange={handleStudentChange}
            className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
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
