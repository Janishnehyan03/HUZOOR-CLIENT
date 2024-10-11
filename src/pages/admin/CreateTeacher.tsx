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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold mb-4 text-teal-600">
            {selectedTeacher ? "Edit Teacher" : "Create Teacher"}
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-500"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeacher;
