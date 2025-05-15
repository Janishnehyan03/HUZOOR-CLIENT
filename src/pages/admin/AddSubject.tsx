import React, { useState, useEffect } from "react";
import Axios from "../../Axios";
import { useNavigate } from "react-router-dom";

interface AddSubjectFormProps {
  onClose: () => void;
  onAdd: (subject: any) => void;
  onEdit: (subject: any) => void;
  initialData?: any;
}

const AddSubjectForm: React.FC<AddSubjectFormProps> = ({
  onClose,
  onAdd,
  onEdit,
  initialData,
}) => {
  const [subjectData, setSubjectData] = useState({
    name: "",
    class: "",
    teacher: "",
  });
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const getClasses = async () => {
    try {
      let { data } = await Axios.get("/class");
      setClasses(data.classes);
    } catch (error: any) {
      console.log(error.response);
    }
  };

  const getTeachers = async () => {
    try {
      let { data } = await Axios.get("/teacher");
      setTeachers(data.teachers);
    } catch (error: any) {
      console.log(error.response);
    }
  };

  const saveSubject = async () => {
    try {
      setSubmitting(true);
      if (initialData) {
        let { data } = await Axios.patch(
          `/subject/${initialData?._id}`,
          subjectData
        );
        navigate(0);
        onEdit(data.subject);
        setSubmitting(false);
      } else {
        setSubmitting(true);
        let { data } = await Axios.post("/subject", subjectData);
        navigate(0);
        onAdd(data.subject);
        setSubmitting(false);
      }
      onClose();
    } catch (error: any) {
      setSubmitting(false);
      console.log(error.response);
    }
  };

  useEffect(() => {
    getClasses();
    getTeachers();
    if (initialData) {
      setSubjectData({
        name: initialData.name,
        class: initialData.class?._id,
        teacher: initialData?.teacher?._id,
      });
    }
  }, [initialData]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">
          {initialData ? "Edit Subject" : "New Subject"}
        </h2>
        <div className="mb-4">
          <label className="block text-gray-700">Subject Name</label>
          <input
            type="text"
            value={subjectData.name}
            onChange={(e) =>
              setSubjectData({ ...subjectData, name: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Class</label>
          <select
            value={subjectData.class}
            onChange={(e) =>
              setSubjectData({ ...subjectData, class: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Select Class</option>
            {classes.map((cls: any) => (
              <option key={cls?._id} value={cls?._id}>
                {cls?.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Teacher</label>
          <select
            value={subjectData.teacher}
            onChange={(e) =>
              setSubjectData({ ...subjectData, teacher: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Select Teacher</option>
            {teachers.map((teacher: any) => (
              <option key={teacher?._id} value={teacher?._id}>
                {teacher?.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end">
          {submitting ? (
            <button className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75">
              Submitting...
            </button>
          ) : (
            <button
              onClick={saveSubject}
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
            >
              Save
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSubjectForm;
