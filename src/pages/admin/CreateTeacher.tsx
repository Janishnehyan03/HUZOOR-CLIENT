import React, { useState } from "react";
import Axios from "../../Axios";
import toast from "react-hot-toast";

interface Props {
  setIsOpen: any;
}

const CreateTeacher: React.FC<Props> = ({ setIsOpen }: Props) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      let response = await Axios.post("/teacher", formData);
      if (response.status === 201) {
        toast.success("Teacher added successfully");
        setLoading(false);
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.response.data.message || "Something went wrong");
      setLoading(false);
      console.log(error.response);
    }
  };

  return (
    <div className=" min-h-screen fixed inset-0 flex items-center justify-center bg-gray-800 opacity-95 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-primary">
          Create Teacher
        </h2>
        <form className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Teacher Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setIsOpen(false)}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {loading ? "Loading..." : "Add Teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeacher;
