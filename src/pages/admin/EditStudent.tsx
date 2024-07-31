import React, { useState, useEffect } from "react";
import Axios from "../../Axios";

interface Class {
  _id: string;
  name: string;
}

interface EditStudentFormProps {
  student: any;
  onClose: () => void;
  onUpdate: (updatedStudent: any) => void;
  classes: Class[];
}

const EditStudentForm: React.FC<EditStudentFormProps> = ({
  student,
  onClose,
  onUpdate,
  classes,
}) => {
  const [name, setName] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [rollNumber, setRollNumber] = useState(0);
  const [selectedClass, setSelectedClass] = useState("");

  useEffect(() => {
    setName(student.name);
    setAdmissionNumber(student.admissionNumber);
    setSelectedClass(student.classId); // Assuming student object has a classId field
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedStudent = {
        ...student,
        name,
        admissionNumber: admissionNumber.toString(),
        class: selectedClass,
        rollNumber,
      };
      await Axios.patch(`/student/${student._id}`, updatedStudent);
      onUpdate(updatedStudent);
      onClose();
    } catch (error: any) {
      console.log(error.response);
    }
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-4">
          <h2 className="text-2xl font-bold mb-4">Edit Student</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-400 p-2 w-full rounded-md"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="admissionNumber"
                className="block font-medium text-gray-700"
              >
                Admission Number
              </label>
              <input
                type="text"
                id="admissionNumber"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                className="border border-gray-400 p-2 w-full rounded-md"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="rollNumber"
                className="block font-medium text-gray-700"
              >
                Roll Number
              </label>
              <input
                type="number"
                id="rollNumber"
                value={rollNumber}
                onChange={(e) => setRollNumber(parseInt(e.target.value))}
                className="border border-gray-400 p-2 w-full rounded-md"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="class"
                className="block font-medium text-gray-700"
              >
                Class
              </label>
              <select
                id="class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="border border-gray-400 p-2 w-full rounded-md"
              >
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditStudentForm;
