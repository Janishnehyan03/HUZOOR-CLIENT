import React, { useEffect, useState } from "react";
import Axios from "../../Axios";
import Loading from "../../components/Loading";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import CreateTeacher from "./CreateTeacher";
import * as XLSX from "xlsx"; // For reading Excel files
import toast from "react-hot-toast";

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
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // Parse the Excel file to show data in modal
      const reader = new FileReader();
      reader.onload = (event) => {
        const binaryStr = event.target?.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(worksheet);
        setExcelData(parsedData);
        setShowModal(true); // Show modal after file is selected and parsed
      };
      reader.readAsBinaryString(selectedFile);
    }
  };

  // Upload Excel file
  const handleUpload = async () => {
    if (!file) return alert("Please select an Excel file first.");
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
      alert("File uploaded successfully!");
      setShowModal(false); // Close modal after upload
      getTeachers(); // Refresh the list after upload
    } catch (error) {
      setLoading(false);
      window.location.reload();
      console.log(error);
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
    <div className="container mx-auto mt-10 p-6 bg-teal-50 rounded-lg shadow-xl">
      {isOpen && (
        <CreateTeacher
          setIsOpen={setIsOpen}
          selectedTeacher={selectedTeacher}
          refreshTeachers={getTeachers} // Pass the function to refresh teachers list
        />
      )}
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-3xl font-bold text-teal-700">Teachers</h1>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setSelectedTeacher(null); // Reset selected teacher for creating new
                  setIsOpen(true);
                }}
                className="bg-teal-600 text-white px-4 py-2 font-semibold rounded-md hover:bg-teal-500"
              >
                Create Teacher
              </button>

              {/* Excel Upload Section */}
              <label className="cursor-pointer flex items-center bg-teal-500 text-white px-4 py-2 font-semibold rounded-md hover:bg-teal-400">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                Select Excel
              </label>
            </div>
          </div>

          <div className="overflow-x-auto shadow-md">
            <table className="min-w-full divide-y divide-teal-300">
              <thead className="bg-teal-100">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider"
                  >
                    #
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider"
                  >
                    Image
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider"
                  >
                    Serial Number
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider"
                  >
                    Edit
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider"
                  >
                    Delete
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider"
                  >
                    Profile
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-teal-200">
                {teachers.map((teacher: any, index) => (
                  <tr key={teacher._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-800">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-800">
                      {teacher?.profileImage ? (
                        <img
                          src={teacher?.profileImage}
                          className="h-16 w-16 object-cover rounded-full"
                        />
                      ) : (
                        <User className="h-16 w-16 text-teal-500" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-800">
                      {teacher.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-800">
                      {teacher?.serialNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-800">
                      <button
                        onClick={() => handleEdit(teacher)} // Open the edit modal
                        className="bg-teal-600 text-white px-4 py-2 font-semibold rounded-md hover:bg-teal-500"
                      >
                        Edit
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-800">
                      <button
                        onClick={(e) => handleDelete(e, teacher._id)} // Open the edit modal
                        className="bg-red-600 text-white px-4 py-2 font-semibold rounded-md hover:bg-red-500"
                      >
                        Delete
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-800">
                      <Link
                        to={`/teacher/${teacher._id}`}
                        className="text-teal-500 hover:text-teal-700 font-semibold"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Excel Data Preview Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center">
              <div className="bg-white p-5 rounded-lg shadow-lg w-full max-w-lg">
                <h2 className="text-lg font-semibold mb-4">Excel Preview</h2>
                <div className="overflow-auto max-h-64">
                  {excelData.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          {Object.keys(excelData[0]).map((key) => (
                            <th
                              key={key}
                              className="px-4 py-2 text-left font-medium text-gray-700"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {excelData.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((val: any, i) => (
                              <td
                                key={i}
                                className="px-4 py-2 text-gray-900 whitespace-nowrap"
                              >
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No data found.</p>
                  )}
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={handleUpload}
                    className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-500"
                  >
                    Upload
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                  >
                    Close
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
