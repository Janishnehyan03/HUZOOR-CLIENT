import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import Axios from "../../Axios";
import Loading from "../../components/Loading";
import EditStudentForm from "./EditStudent";

// PDF export
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Class {
  _id: string;
  name: string;
}

interface Student {
  _id?: string;
  name: string;
  class: Class;
  admissionNumber: string;
  rollNumber: number;
}

const StudentTable: React.FC = () => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewStudents, setPreviewStudents] = useState<Student[]>([]);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Memoized table headers for performance
  const tableHeaders = useMemo(
    () => ["#", "Name", "Admission Number", "Edit", "Delete"],
    []
  );

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const { data } = await Axios.get("/class");
        setClasses(data.classes);
      } catch (error: any) {
        console.error(error?.response);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  // Fetch students
  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }
    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const { data } = await Axios.get(
          `/student?class=${selectedClass}&sortBy=rollNumber`
        );
        setStudents(data.students);
      } catch (error: any) {
        console.error(error?.response);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [selectedClass]);

  // Edit student handlers
  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setShowEditForm(true);
  };

  const handleUpdate = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((student) =>
        student._id === updatedStudent._id ? updatedStudent : student
      )
    );
  };

  // Delete student
  const deleteStudent = async (studentId: string) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;
    try {
      await Axios.delete(`/student/${studentId}`);
      setStudents((prev) => prev.filter((s) => s._id !== studentId));
    } catch (error: any) {
      console.error(error?.response);
      alert("Failed to delete student.");
    }
  };

  // Excel file parsing
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

  // Upload students
  const handleUploadClick = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await Axios.post("/student/excel-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      setPreviewStudents([]);
      alert("Data uploaded successfully");
      // Optionally refetch students
      if (selectedClass) setTimeout(() => getStudents(selectedClass), 500);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  // Export students to Excel
  const handleExcelDownload = () => {
    const ws = XLSX.utils.json_to_sheet(
      students.map(({ name, admissionNumber, rollNumber, class: c }) => ({
        name,
        admissionNumber,
        rollNumber,
        class: classes.find((cl) => cl._id === c._id)?.name || c.name,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students.xlsx");
  };

  // Export students to PDF
  const handlePDFDownload = () => {
    const doc = new jsPDF();
    doc.text("Students", 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [["#", "Name", "Admission Number", "Class"]],
      body: students.map((student) => [
        student.rollNumber,
        student.name,
        student.admissionNumber,
        classes.find((c) => c._id === student.class._id)?.name ||
          student.class.name,
      ]),
    });
    doc.save("students.pdf");
  };

  // Fetch students utility for after upload
  const getStudents = async (classId: string) => {
    setLoadingStudents(true);
    try {
      const { data } = await Axios.get(
        `/student?class=${classId}&sortBy=rollNumber`
      );
      setStudents(data.students);
    } catch (error: any) {
      console.error(error?.response);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Loading UI
  if (loadingClasses || loadingStudents) return <Loading />;

  return (
    <div className="container mx-auto px-6 py-12 bg-gray-50 min-h-screen">
      {/* Edit Modal */}
      {showEditForm && editingStudent && (
        <EditStudentForm
          student={editingStudent}
          classes={classes}
          onClose={() => setShowEditForm(false)}
          onUpdate={handleUpdate}
        />
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Students</h1>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExcelDownload}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
            disabled={!students.length}
            title="Download Excel"
          >
            Download Excel
          </button>
          <button
            onClick={handlePDFDownload}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            disabled={!students.length}
            title="Download PDF"
          >
            Download PDF
          </button>
          <Link to="/add-student">
            <button className="bg-teal-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition">
              Add Student
            </button>
          </Link>
        </div>
      </div>

      {/* Class Selection */}
      <div className="mb-8">
        <label
          htmlFor="class-select"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Class
        </label>
        <select
          id="class-select"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-3"
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
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <label
          htmlFor="file-upload"
          className="cursor-pointer bg-teal-100 text-teal-700 px-5 py-2.5 rounded-lg font-medium hover:bg-teal-200 transition duration-300"
        >
          Select Excel File
          <input
            id="file-upload"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {file && (
          <button
            onClick={() => setModalIsOpen(true)}
            className="bg-teal-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition duration-300 disabled:bg-teal-300"
            disabled={uploading}
          >
            Upload File
          </button>
        )}
      </div>

      {/* Preview Students Before Upload */}
      {previewStudents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Preview Students
          </h2>
          <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-teal-50">
                <tr>
                  {["Name", "Admission Number", "Class", "Roll Number"].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-teal-600 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewStudents.map((student, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {student.admissionNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {student.class.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {student.rollNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-teal-50">
            <tr>
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-teal-600 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student: any) => (
              <tr key={student._id} className="hover:bg-teal-50 transition">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {student?.rollNumber}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {student.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {student.admissionNumber}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleEditClick(student)}
                    className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 transition"
                  >
                    Edit
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => deleteStudent(student._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!students.length && (
              <tr>
                <td
                  colSpan={tableHeaders.length}
                  className="text-center py-8 text-gray-500"
                >
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {modalIsOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Confirm Upload
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to upload the selected file?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setModalIsOpen(false);
                  handleUploadClick();
                }}
                className="bg-teal-600 text-white px-5 py-2 rounded-md font-medium hover:bg-teal-700 transition"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Confirm"}
              </button>
              <button
                onClick={() => setModalIsOpen(false)}
                className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md font-medium hover:bg-gray-300 transition"
                disabled={uploading}
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
