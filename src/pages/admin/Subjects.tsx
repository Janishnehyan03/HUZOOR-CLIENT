import { useEffect, useState } from "react";
import Axios from "../../Axios";
import AddSubjectForm from "./AddSubject";
import Loading from "../../components/Loading";
import { Link } from "react-router-dom";
import { Settings, UploadCloud } from "lucide-react";
import * as XLSX from "xlsx";

function Subjects() {
  const [subjects, setSubjects] = useState<any>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<any[]>([]); // Updated to store parsed Excel data
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false); // New state for showing modal

  const getSubjects = async () => {
    try {
      setLoading(true);
      let { data } = await Axios.get("/subject");
      setSubjects(data.subjects);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.log(error.response);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseExcel(selectedFile); // Parse Excel when selected
    }
  };

  const parseExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Convert to JSON
      setFilePreview(data); // Store parsed data as preview
      setShowModal(true); // Show modal when file is parsed
    };
    reader.readAsBinaryString(file);
  };

  const handleFileUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const { data } = await Axios.post("/subject/excel-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubjects([...subjects, ...data.subjects]);
      setFile(null);
      setFilePreview([]); // Clear preview after upload
      setShowModal(false); // Close modal after upload
      alert("File uploaded successfully!");
    } catch (error: any) {
      console.error(error.response);
      window.location.reload();
    } finally {
      setIsUploading(false);
    }
  };

  const addSubject = (subject: any) => {
    setSubjects([...subjects, subject]);
  };

  const editSubject = (updatedSubject: any) => {
    setSubjects(
      subjects.map((subject: any) =>
        subject._id === updatedSubject._id ? updatedSubject : subject
      )
    );
  };

  useEffect(() => {
    getSubjects();
  }, []);

  return (
    <div>
      <h1 className="bg-gray-800 p-4 text-white text-center text-2xl font-bold uppercase my-3">
        Subjects
      </h1>
      <div className="flex justify-between items-center m-8">
        {/* Create New Subject Button */}
        <button
          onClick={() => {
            setEditingSubject(null);
            setShowForm(true);
          }}
          className="mb-4 px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75 transition duration-300"
        >
          Create New Subject
        </button>

        {/* File Upload Section */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
              id="excel-upload"
            />
            <label
              htmlFor="excel-upload"
              className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg cursor-pointer shadow-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75 transition duration-300"
            >
              Select Excel
            </label>
          </div>
        </div>
      </div>

      {/* Modal for Excel Preview */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-3/4">
            <h2 className="text-xl font-bold mb-4">Excel File Preview</h2>
            <div className="max-h-96 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    {filePreview[0] &&
                      filePreview[0].map((header: any, index: number) => (
                        <th
                          key={index}
                          className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                        >
                          {header}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {filePreview.slice(1).map((row: any, rowIndex: number) => (
                    <tr key={rowIndex}>
                      {row.map((cell: any, cellIndex: number) => (
                        <td
                          key={cellIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={handleFileUpload}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Section */}
      {showForm && (
        <AddSubjectForm
          onClose={() => setShowForm(false)}
          onAdd={addSubject}
          onEdit={editSubject}
          initialData={editingSubject}
        />
      )}

      {/* Table Section */}
      <div className="flex flex-col m-8">
        <div className="-m-1.5 overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              {loading ? (
                <Loading />
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                        #
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                        Class
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                        Teacher
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                        Students
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                        Edit
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                        Manage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {subjects.length > 0 &&
                      subjects.map((subject: any, index: number) => (
                        <tr key={subject._id} className="hover:bg-gray-100">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {subject.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {subject.class.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-start">
                            {subject.teacher?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-start">
                            {subject.students?.length}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-start">
                            <button
                              onClick={() => {
                                setEditingSubject(subject);
                                setShowForm(true);
                              }}
                              className="text-teal-500 hover:underline"
                            >
                              Edit
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-start">
                            <Link
                              to={`/admin/subject/${subject._id}`}
                              className="text-teal-500 hover:underline"
                            >
                              <Settings className="inline-block mr-1" />
                              Manage
                            </Link>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Subjects;
