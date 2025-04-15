import { useEffect, useState } from "react";
import Axios from "../../Axios";
import CreateClass from "./components/CreateClass";
import EditClass from "./components/EditClass";

const ManageClasses = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);

  useEffect(() => {
    // Fetch the list of classes
    Axios.get("/class").then((response) => {
      setClasses(response.data.classes);
    });
  }, [isOpen]);

  // Function to delete a class
  const handleDelete = async (classId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this class?"
    );
    if (confirmDelete) {
      try {
        await Axios.delete(`/class/${classId}`); // Replace with your actual delete endpoint
        setClasses(classes.filter((classItem) => classItem._id !== classId)); // Update the state to remove the deleted class
        alert("Class deleted successfully!");
      } catch (error) {
        console.error("Failed to delete class:", error);
        alert("Error deleting class. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen p-6">
      {isOpen && <CreateClass setIsOpen={setIsOpen} />}
      {isOpenEdit && selectedClass && (
        <EditClass setIsOpen={setIsOpenEdit} selectedClass={selectedClass} />
      )}

      <div className="bg-white border border-indigo-100 shadow-lg rounded-3xl p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-indigo-800">Manage Classes</h1>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium border border-indigo-600 hover:bg-transparent hover:text-indigo-600 transition-all duration-200"
          >
            + Create Class
          </button>
        </div>

        {/* Table */}
        {classes.length > 0 ? (
          <div className="overflow-x-auto mt-8 rounded-xl shadow-sm">
            <table className="min-w-full bg-white text-left border border-indigo-100">
              <thead className="bg-indigo-100 text-indigo-800 text-sm font-semibold">
                <tr>
                  <th className="py-3 px-6">Class Name</th>
                  <th className="py-3 px-6">Serial Number</th>
                  <th className="py-3 px-6">Edit</th>
                  <th className="py-3 px-6">Delete</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((classItem, index) => (
                  <tr
                    key={classItem._id}
                    className={`${
                      index % 2 === 0 ? "bg-indigo-50" : "bg-white"
                    } hover:bg-indigo-100/50 transition`}
                  >
                    <td className="py-3 px-6 text-sm">{classItem.name}</td>
                    <td className="py-3 px-6 text-sm">
                      {classItem.serialNumber}
                    </td>
                    <td className="py-3 px-6">
                      <button
                        onClick={() => {
                          setSelectedClass(classItem._id);
                          setIsOpenEdit(true);
                        }}
                        className="bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm border border-indigo-500 hover:bg-transparent hover:text-indigo-500 transition-all"
                      >
                        Edit
                      </button>
                    </td>
                    <td className="py-3 px-6">
                      <button
                        onClick={() => handleDelete(classItem._id)}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm border border-red-500 hover:bg-transparent hover:text-red-500 transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center mt-10 text-gray-500 text-lg">
            No classes available yet. Click "Create Class" to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageClasses;
