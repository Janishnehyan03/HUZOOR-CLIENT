import { useEffect, useState } from "react";
import Axios from "../../Axios";
import toast from "react-hot-toast";

// Define the types for props
interface CreateTeacherProps {
  setIsOpen: (isOpen: boolean) => void;
  selectedTeacher: {
    _id: string;
    name: string;
    password: string;
  } | null;
  refreshTeachers: () => void;
}

const CreateTeacher: React.FC<CreateTeacherProps> = ({
  setIsOpen,
  selectedTeacher,
  refreshTeachers,
}) => {
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [profileImage, setProfileImage] = useState<File | null>(null);

  useEffect(() => {
    if (selectedTeacher) {
      // If editing, set the current teacher's data into the form
      setName(selectedTeacher.name);
      setPassword(selectedTeacher.password);
      setProfileImage(null); // Handle the image upload if needed
    } else {
      // Reset form when creating
      setName("");
      setPassword("");
      setProfileImage(null);
    }
  }, [selectedTeacher]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("password", password);
    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    try {
      if (selectedTeacher) {
        // If there's a selected teacher, update the teacher
        await Axios.patch(`/teacher/${selectedTeacher._id}`, formData);
        toast.success("Teacher Edited");
      } else {
        // If creating a new teacher
        await Axios.post("/teacher", formData);
        toast.success("Teacher Created");
      }
      refreshTeachers(); // Refresh the teacher list
      setIsOpen(false); // Close the modal
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedTeacher ? "Edit Teacher" : "Create Teacher"}
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                placeholder="Enter teacher's name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                placeholder="Enter password"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium shadow-sm"
            >
              {selectedTeacher ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeacher;
