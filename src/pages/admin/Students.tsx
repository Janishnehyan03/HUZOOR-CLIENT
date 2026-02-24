import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import Axios from "../../Axios";
import Loading from "../../components/Loading";
import EditStudentForm from "./EditStudent";
import {
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Upload,
  Users,
  X,
} from "lucide-react";
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

  const tableHeaders = useMemo(
    () => ["#", "Name", "Admission Number", "Edit", "Delete"],
    []
  );

  const selectedClassName = useMemo(() => {
    const activeClass = classes.find((item) => item._id === selectedClass);
    return activeClass?.name || "No class selected";
  }, [classes, selectedClass]);

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

  const deleteStudent = async (studentId: string) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      await Axios.delete(`/student/${studentId}`);
      setStudents((prev) => prev.filter((student) => student._id !== studentId));
    } catch (error: any) {
      console.error(error?.response);
      alert("Failed to delete student.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      setPreviewStudents([]);
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const data = new Uint8Array(readerEvent.target?.result as ArrayBuffer);
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

    reader.readAsArrayBuffer(selectedFile);
  };

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
      if (selectedClass) setTimeout(() => getStudents(selectedClass), 500);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  const clearSelectedFile = () => {
    setFile(null);
    setPreviewStudents([]);
  };

  const handleExcelDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      students.map(({ name, admissionNumber, rollNumber, class: classData }) => ({
        name,
        admissionNumber,
        rollNumber,
        class:
          classes.find((item) => item._id === classData._id)?.name ||
          classData.name,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "students.xlsx");
  };

  const handlePDFDownload = () => {
    const document = new jsPDF();
    document.text("Students", 14, 14);

    autoTable(document, {
      startY: 20,
      head: [["#", "Name", "Admission Number", "Class"]],
      body: students.map((student) => [
        student.rollNumber,
        student.name,
        student.admissionNumber,
        classes.find((item) => item._id === student.class._id)?.name ||
          student.class.name,
      ]),
    });

    document.save("students.pdf");
  };

  if (loadingClasses || loadingStudents) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-8">
      {showEditForm && editingStudent && (
        <EditStudentForm
          student={editingStudent}
          classes={classes}
          onClose={() => setShowEditForm(false)}
          onUpdate={handleUpdate}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 p-6 sm:p-8 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-slate-300 text-xs sm:text-sm font-medium mb-2 tracking-wide">
                STUDENT MANAGEMENT
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                Students Dashboard
              </h1>
              <p className="text-slate-200 mt-2 text-sm sm:text-base">
                Manage records, upload bulk data, and export reports with a
                cleaner workflow.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/20 px-5 py-4 min-w-[220px] shadow-inner">
              <p className="text-xs uppercase tracking-wide text-slate-300">
                Active Class
              </p>
              <p className="mt-1 text-white text-base sm:text-lg font-semibold break-words">
                {selectedClassName}
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Students in Class</p>
              <span className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-indigo-700" />
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {students.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Preview Rows</p>
              <span className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {previewStudents.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Available Classes</p>
              <span className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-amber-700" />
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {classes.length}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Class Controls</h2>
            <p className="text-sm text-slate-500 mt-1">
              Select class, export data, and add students.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:items-end">
            <div className="xl:col-span-5">
              <label
                htmlFor="class-select"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Select Class
              </label>
              <select
                id="class-select"
                value={selectedClass}
                onChange={(event) => setSelectedClass(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
              >
                <option value="">Select a class</option>
                {classes.map((classItem) => (
                  <option key={classItem._id} value={classItem._id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="xl:col-span-7 flex flex-wrap items-center xl:justify-end gap-3">
              <button
                onClick={handleExcelDownload}
                className="inline-flex items-center justify-center gap-2 min-w-[140px] rounded-xl bg-emerald-600 px-4 py-2.5 text-white text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-60"
                disabled={!students.length}
                title="Download Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </button>
              <button
                onClick={handlePDFDownload}
                className="inline-flex items-center justify-center gap-2 min-w-[130px] rounded-xl bg-blue-600 px-4 py-2.5 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60"
                disabled={!students.length}
                title="Download PDF"
              >
                <FileText className="w-4 h-4" />
                Export PDF
              </button>
              <Link
                to="/add-student"
                className="inline-flex items-center justify-center min-w-[132px] rounded-xl bg-slate-900 px-5 py-2.5 text-white text-sm font-medium hover:bg-slate-800 transition"
              >
                Add Student
              </Link>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Bulk Upload</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-3">
              Step 1: Select Excel file. Step 2: Review preview. Step 3: Upload.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="file-upload"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                <Upload className="w-4 h-4" />
                Select Excel File
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {!file && (
                <span className="text-xs sm:text-sm text-slate-500">
                  No file selected
                </span>
              )}

              {file && (
                <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 text-indigo-700 px-3 py-1.5 text-xs sm:text-sm font-medium max-w-full">
                  <span className="truncate max-w-[220px] sm:max-w-[320px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    className="inline-flex items-center justify-center rounded-md p-0.5 hover:bg-indigo-100"
                    aria-label="Clear selected file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {file && (
                <button
                  onClick={() => setModalIsOpen(true)}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60"
                  disabled={uploading}
                >
                  Upload File
                </button>
              )}
            </div>
          </div>
        </section>

        {previewStudents.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Preview Students
            </h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full">
                <thead className="bg-slate-100">
                  <tr>
                    {["Name", "Admission Number", "Class", "Roll Number"].map(
                      (header) => (
                        <th
                          key={header}
                          className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {previewStudents.map((student, index) => (
                    <tr key={index} className="hover:bg-indigo-50/40 transition">
                      <td className="px-5 py-3 text-sm text-slate-800">
                        {student.name}
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-800">
                        {student.admissionNumber}
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-800">
                        {student.class?.name}
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-800">
                        {student.rollNumber}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Students List</h2>
            <span className="text-sm text-slate-500">{students.length} records</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full">
              <thead className="bg-slate-100">
                <tr>
                  {tableHeaders.map((header) => (
                    <th
                      key={header}
                      className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-indigo-50/40 transition">
                    <td className="px-5 py-3 text-sm text-slate-800">
                      {student.rollNumber}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-800">
                      {student.name}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-800">
                      {student.admissionNumber}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleEditClick(student)}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white text-sm font-medium hover:bg-indigo-700 transition"
                      >
                        Edit
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => deleteStudent(student._id as string)}
                        className="rounded-lg bg-rose-600 px-3 py-1.5 text-white text-sm font-medium hover:bg-rose-700 transition"
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
                      className="py-10 text-center text-sm text-slate-500"
                    >
                      {selectedClass
                        ? "No students found for this class."
                        : "Select a class to view students."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {modalIsOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              Confirm Upload
            </h2>
            <p className="text-slate-600 mb-6">
              Are you sure you want to upload the selected student file?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setModalIsOpen(false);
                  handleUploadClick();
                }}
                className="rounded-lg bg-slate-900 px-4 py-2 text-white text-sm font-medium hover:bg-slate-800 transition"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Confirm"}
              </button>
              <button
                onClick={() => setModalIsOpen(false)}
                className="rounded-lg bg-slate-200 px-4 py-2 text-slate-700 text-sm font-medium hover:bg-slate-300 transition"
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
