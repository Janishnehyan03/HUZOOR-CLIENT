import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx"; // For reading Excel files
import Axios from "../../Axios";
import Loading from "../../components/Loading";
import CreateTeacher from "./CreateTeacher";
import { Plus, Upload } from "lucide-react";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<any[]>([]); // To store parsed Excel data
  const [showModal, setShowModal] = useState(false); // Control for modal
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null); // Store selected teacher for editing

  const getTeachers = async () => {
    setLoading(true);
    try {
      let { data } = await Axios.get("/teacher");
      setLoading(false);
      setTeachers(data.teachers);
    } catch (error: any) {
      setLoading(false);
      console.log(error.response);
    }
  };

  useEffect(() => {
    getTeachers();
  }, []);

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const selectedFile = e.target.files[0];

    // Validate file type
    if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert("Please upload an Excel file (.xlsx, .xls, or .csv)");
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const binaryStr = event.target?.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(worksheet);

        if (parsedData.length === 0) {
          alert("The Excel file is empty or couldn't be parsed");
          return;
        }

        setExcelData(parsedData);
        setShowModal(true);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        alert(
          "Error parsing Excel file. Please check the format and try again."
        );
      }
    };

    reader.onerror = () => {
      alert("Error reading file. Please try again.");
    };

    reader.readAsBinaryString(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an Excel file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await Axios.post("/teacher/upload-excel", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setLoading(false);
      setShowModal(false); // Close the modal after upload
      toast.success("Excel file uploaded successfully!");
      getTeachers(); // Refresh the teacher list after upload
      window.location.reload(); // Reload the page to reflect changes
    } catch (error: any) {
      setLoading(false);
      console.error("Upload error:", error);

      // More specific error messages
      if (error.response) {
        const { data } = error.response;
        if (data.message) {
          alert(`Upload failed: ${data.message}`);
        } else if (data.error) {
          alert(`Upload failed: ${data.error}`);
        } else {
          alert("Upload failed. Please check the file format and try again.");
        }
      } else if (error.request) {
        alert("Upload failed. No response from server.");
      } else {
        alert("Upload failed. Please check your connection and try again.");
      }

      // Don't reload the page automatically - let the user decide
      // window.location.reload();
    }
  };

  // Function to handle edit
  const handleEdit = (teacher: any) => {
    setSelectedTeacher(teacher); // Set the selected teacher to edit
    setIsOpen(true); // Open the CreateTeacher modal
  };
  const handleDelete = async (e: any, teacherId: string) => {
    e.preventDefault();

    if (window.confirm("Do you want to delete this teacher")) {
      try {
        await Axios.delete(`/teacher/${teacherId}`);
        getTeachers(); // Refresh the teacher list
        setIsOpen(false); // Close the modal
        toast.success("Teacher Deleted");
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isOpen && (
        <CreateTeacher
          setIsOpen={setIsOpen}
          selectedTeacher={selectedTeacher}
          refreshTeachers={getTeachers}
        />
      )}

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800">
                Teacher Management
              </h1>
              <p className="text-gray-500 mt-2">
                Manage all faculty members and their details efficiently.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                onClick={() => {
                  setSelectedTeacher(null);
                  setIsOpen(true);
                }}
                className="bg-indigo-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-md"
              >
                <Plus className="h-5 w-5" />
                Add Teacher
              </button>

              <label className="cursor-pointer flex items-center justify-center gap-3 bg-white border border-indigo-600 text-indigo-600 px-5 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-all shadow-md">
                <Upload className="h-5 w-5" />
                Import Excel
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    {["#", "Name", "Serial Number", "Actions"].map((col) => (
                      <th
                        key={col}
                        scope="col"
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teachers.map((teacher: any, index) => (
                    <tr
                      key={teacher._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {teacher.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {teacher?.serialNumber || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-4">
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="text-indigo-600 hover:text-indigo-900 transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, teacher._id)}
                          className="text-red-600 hover:text-red-900 transition-all"
                        >
                          Delete
                        </button>
                        <Link
                          to={`/teacher/${teacher._id}`}
                          className="text-gray-600 hover:text-gray-900 transition-all"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Excel Import Preview
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Review the data before uploading it to the system.
                  </p>
                </div>

                <div className="overflow-auto p-6">
                  {excelData.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-gray-600 uppercase tracking-wide">
                            #
                          </th>
                          {Object.keys(excelData[0]).map((key) => (
                            <th
                              key={key}
                              className="px-4 py-3 text-left font-medium text-gray-600 uppercase tracking-wide"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {excelData.map((row, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                              {index + 1}
                            </td>
                            {Object.values(row).map((val: any, i) => (
                              <td
                                key={i}
                                className="px-4 py-3 text-gray-700 whitespace-nowrap"
                              >
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500">
                      No data found in the Excel file.
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    className="px-5 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                  >
                    Confirm Upload
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Teachers;
