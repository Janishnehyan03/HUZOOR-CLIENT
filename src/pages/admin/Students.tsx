import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import Axios from "../../Axios";
import Loading from "../../components/Loading";
import EditStudentForm from "./EditStudent";

interface Class {
  _id: string;
  name: string;
}

interface Student {
  _id?: string;
  name: string;
  class: string;
  admissionNumber: string;
  rollNumber: number;
}

const StudentTable: React.FC = () => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [loadingClasses, setLoadingClasses] = useState(false); // Separate state for classes
  const [loadingStudents, setLoadingStudents] = useState(false); // Separate state for students
  const [file, setFile] = useState<File | null>(null);
  const [previewStudents, setPreviewStudents] = useState<Student[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetching classes
  const getClasses = async () => {
    try {
      setLoadingClasses(true);
      const { data } = await Axios.get("/class");
      setClasses(data.classes);
    } catch (error: any) {
      console.error(error.response);
    } finally {
      setLoadingClasses(false); // Always stop loading regardless of success or failure
    }
  };

  // Fetching students
  const getStudents = async (classId: string) => {
    try {
      setLoadingStudents(true);
      const { data } = await Axios.get(
        `/student?class=${classId}&sortBy=rollNumber`
      );
      setStudents(data.students);
    } catch (error: any) {
      console.error(error.response);
    } finally {
      setLoadingStudents(false); // Always stop loading regardless of success or failure
    }
  };

  // Handle edit click
  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setShowEditForm(true);
  };

  // Update the student data in state
  const handleUpdate = (updatedStudent: Student) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student._id === updatedStudent._id ? updatedStudent : student
      )
    );
  };

  // Delete a student
  const deleteStudent = async (studentId: string) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await Axios.delete(`/student/${studentId}`);
        getStudents(selectedClass); // Refetch the students after deletion
      } catch (error: any) {
        console.error(error.response);
      }
    }
  };

  // Handle file input and Excel parsing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        const parsedData: Student[] = jsonData.map((row: any) => ({
          name: row.name,
          admissionNumber: row.admissionNumber,
          rollNumber: row.rollNumber,
          class: row.class,
        }));
        setPreviewStudents(parsedData);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Upload students to the server
  const handleUploadClick = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await Axios.post("/student/excel-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setFile(null); // Clear the file input
      setPreviewStudents([]);
      alert("Data uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Something went wrong");
    } finally {
      setUploading(false);
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

  // Loading conditions for different actions
  if (loadingClasses) {
    return <Loading message="Loading classes..." />;
  }

  if (loadingStudents) {
    return <Loading message="Loading students..." />;
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

      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold text-teal-700">Students</h1>
        <Link to={"/add-student"}>
          <button className="bg-teal-600 rounded hover:bg-transparent hover:text-teal-600 font-semibold border border-teal-600 cursor-pointer transition px-3 py-2 text-white">
            Add Student
          </button>
        </Link>
      </div>

      {/* Class Selection */}
      <div className="mb-5">
        <label
          htmlFor="class-select"
          className="block text-lg font-medium text-teal-700"
        >
          Select Class
        </label>
        <select
          id="class-select"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="bg-teal-50 border border-teal-300 text-teal-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
        >
          <option value="">Select a class</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {/* Excel Upload Section */}
      <div className="flex items-center gap-4">
        {/* Select Excel Button */}
        <label
          htmlFor="file-upload"
          className="bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-teal-700"
        >
          Select Excel File
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Upload Button (only visible after file selection) */}
        {file && (
          <button
            onClick={handleUploadClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            disabled={uploading}
          >
            Upload File
          </button>
        )}
      </div>

      {/* Preview Students Before Upload */}
      {previewStudents.length > 0 && (
        <div className="mt-5">
          <h2 className="text-lg font-bold text-teal-700">Preview Students</h2>
          <table className="min-w-full divide-y divide-teal-200 mt-3">
            <thead className="bg-teal-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-teal-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-teal-600 uppercase tracking-wider">
                  Admission Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-teal-600 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-teal-600 uppercase tracking-wider">
                  Roll Number
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-teal-200">
              {previewStudents.map((student, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-900">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-900">
                    {student.admissionNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-900">
                    {student.class}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-900">
                    {student.rollNumber}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Students Table */}
      <div className="overflow-x-auto mt-5">
        <table className="min-w-full divide-y divide-teal-200">
          <thead className="bg-teal-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-teal-600 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-teal-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-teal-600 uppercase tracking-wider">
                Admission Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-teal-600 uppercase tracking-wider">
                Edit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-teal-600 uppercase tracking-wider">
                Delete
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-teal-200">
            {students.map((student) => (
              <tr key={student._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-900">
                  {student?.rollNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-900">
                  {student.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-900">
                  {student.admissionNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-900">
                  <button
                    onClick={() => handleEditClick(student)}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded"
                  >
                    Edit
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-900">
                  <button
                    onClick={() => deleteStudent(student._id!)}
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

      {/* Upload Modal */}
      {modalIsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="modal bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirm Upload</h2>
            <p>Are you sure you want to upload the selected file?</p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleUploadClick}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
              <button
                onClick={() => setModalIsOpen(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
