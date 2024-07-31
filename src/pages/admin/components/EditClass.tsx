import React, { useEffect, useState } from "react";
import Axios from "../../../Axios";
import toast from "react-hot-toast";

interface Props {
  setIsOpen: any;
  selectedClass: string;
}
const EditClass: React.FC<Props> = ({ setIsOpen, selectedClass }: Props) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      let response = await Axios.patch(`/class/${selectedClass}`, { name });
      if (response.status === 200) {
        toast.success("class edit successfully");
        setLoading(false);
        window.location.reload();
      }
    } catch (error: any) {
      toast.error("Something went wrong");
      setLoading(false);
      console.log(error.response);
    }
  };
  const getClass = async () => {
    try {
      let response = await Axios.get(`/class/${selectedClass}`);
      setName(response.data.name);
    } catch (error: any) {
      toast.error("Something went wrong");
      console.log(error.response);
    }
  };

  useEffect(() => {
    getClass();
  }, [selectedClass]);

  return (
    <div className="min-h-screen fixed inset-0 flex items-center justify-center bg-gray-800 opacity-95 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-primary">
          Edit class
        </h2>
        <form className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Class Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setIsOpen(false)}
              className="inline-flex bg-gray-700 justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {loading ? "Loading..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClass;
