import React, { FormEvent, useEffect, useState } from "react";
import Axios from "../../Axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AddStudentForm: React.FC = () => {
  const [name, setName] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await Axios.get("/class"); // Replace with your API endpoint
        setClasses(response.data.classes);
      } catch (error) {
        console.error("Error fetching classes:", error);
        setError("Failed to load classes");
      }
    };

    fetchClasses();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!name || !admissionNumber || !selectedClass) {
      setError("All fields are required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await Axios.post("/student", {
        name,
        admissionNumber,
        class: selectedClass,
      }); // Replace with your API endpoint
      setName("");
      setAdmissionNumber("");
      setSelectedClass("");
      toast.success("Student added");
      navigate("/");
      // Optionally handle success (e.g., show a success message or redirect)
    } catch (error) {
      console.error("Error adding student:", error);
      setError("Failed to add student");
      toast.error("something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Add Student</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Admission Number</label>
          <input
            type="text"
            value={admissionNumber}
            onChange={(e) => setAdmissionNumber(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a class</option>
            {classes?.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Student"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudentForm;
