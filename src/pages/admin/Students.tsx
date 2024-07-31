import React, { useEffect, useState } from "react";
import Axios from "../../Axios";
import { Link } from "react-router-dom";
import EditStudentForm from "./EditStudent";
import Loading from "../../components/Loading";

interface Class {
  _id: string;
  name: string;
}

interface Student {
  _id: string;
  name: string;
  admissionNumber: string;
  rollNumber: number;
}

const StudentTable: React.FC = () => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const getClasses = async () => {
    try {
      setLoading(true);
      const { data } = await Axios.get("/class");
      setClasses(data.classes);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.log(error.response);
    }
  };
  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setShowEditForm(true);
  };
  const handleUpdate = (updatedStudent: Student) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student._id === updatedStudent._id ? updatedStudent : student
      )
    );
  };

  const getStudents = async (classId: string) => {
    setLoading(true);
    try {
      const { data } = await Axios.get(
        `/student?class=${classId}&sortBy=rollNumber`
      );
      setStudents(data.students);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.log(error.response);
    }
  };
  const deleteStudent = async (studentId: string) => {
    if (window.confirm("Are you sure to delete the student?")) {
      try {
        await Axios.delete(`/student/${studentId}`);
        getStudents(selectedClass);
      } catch (error: any) {
        setLoading(false);
        console.log(error.response);
      }
    }
  };

  useEffect(() => {
    getClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      getStudents(selectedClass);
    }
  }, [selectedClass]);
  if (loading) {
    return <Loading />;
  }
  return (
    <div className="container mx-auto p-4 mt-10">
      {showEditForm && editingStudent && (
        <EditStudentForm
          student={editingStudent}
          classes={classes}
          onClose={() => setShowEditForm(false)}
          onUpdate={handleUpdate}
        />
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-5 text-green-700">Students</h1>
        <Link to={"/add-student"}>
          <button className="bg-green-600 rounded-3xl hover:bg-transparent hover:text-green-600 font-semibold border border-green-600 cursor-pointer transition px-3 py-2 text-white">
            Add Student{" "}
          </button>
        </Link>
      </div>
      <div className="mb-5">
        <label
          htmlFor="class-select"
          className="block text-lg font-medium text-green-700"
        >
          Select Class
        </label>
        <select
          id="class-select"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="
      bg-green-50 border border-green-300 text-green-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 "
        >
          <option value="">Select a class</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-green-200">
          <thead className="bg-green-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider"
              >
                #
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider"
              >
                Admission Number
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider"
              >
                Edit
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider"
              >
                Delete
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-green-200">
            {students.map((student) => (
              <tr key={student._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">
                  {student?.rollNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">
                  {student.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">
                  {student.admissionNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">
                  <button
                    onClick={() => handleEditClick(student)}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
                  >
                    Edit
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">
                  <button
                    onClick={() => deleteStudent(student._id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;
