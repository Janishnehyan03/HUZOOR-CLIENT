import { XCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Axios from "../../Axios";
import Loading from "../../components/Loading";

function ManageSubject() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState<any>(null);
  const [students, setStudents] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [allSelected, setAllSelected] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Function to fetch subject detail
  const getSubject = async () => {
    try {
      setLoading(true);
      let { data } = await Axios.get(`/subject/${subjectId}`);
      setSubject(data?.subject);
      if (data?.subject?.students) {
        setStudents(data.subject.students.map((student: any) => student._id));
      }
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.log(error.response);
    }
  };

  const getClasses = async () => {
    try {
      let { data } = await Axios.get(`/class`);
      setClasses(data.classes);
    } catch (error: any) {
      console.log(error.response);
    }
  };

  // Function to fetch students based on selected class
  const getStudentsByClass = async (classId: string) => {
    try {
      let { data } = await Axios.get(`/student?class=${classId}`);
      setClassStudents(data.students);
    } catch (error: any) {
      console.log(error.response);
    }
  };

  // Function to handle class selection
  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClassId = e.target.value;
    setSelectedClass(selectedClassId);
    if (selectedClassId) {
      getStudentsByClass(selectedClassId);
    } else {
      setClassStudents([]);
    }
  };

  // Function to handle student selection
  const handleStudentSelection = (studentId: string) => {
    const updatedStudents = [...students];
    const index = updatedStudents.indexOf(studentId);
    if (index === -1) {
      updatedStudents.push(studentId);
    } else {
      updatedStudents.splice(index, 1);
    }
    setStudents(updatedStudents);
  };

  const handleDeselectAll = () => {
    setStudents([]);
    setAllSelected(false);
  };

  // Function to select all students
  const handleSelectAll = () => {
    const allStudentIds = classStudents.map((student) => student._id);
    setStudents(allStudentIds);
    setAllSelected(true);
  };

  // Function to toggle between Select All and Deselect All
  const toggleSelectAll = () => {
    if (allSelected) {
      handleDeselectAll();
    } else {
      handleSelectAll();
    }
  };

  const addStudents = async () => {
    try {
      await Axios.post(`/subject/${subjectId}/add-students`, { students });
      toast.success("successfully students added");
      navigate(0);
    } catch (error: any) {
      console.log(error.response);
      toast.error("Something went wrong");
    }
  };
  // Function to render student options
  const renderStudentOptions = () => {
    return classStudents.map((student: any) => (
      <div
        className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        key={student._id}
      >
        <input
          type="checkbox"
          className="form-checkbox mx-3 h-5 w-5 text-primary transition duration-150 ease-in-out"
          id={student._id}
          value={student._id}
          checked={students.includes(student._id)}
          onChange={() => handleStudentSelection(student._id)}
        />
        <label htmlFor={student._id}>{student.name}</label>
      </div>
    ));
  };

  const handleRemove = async (studentId: string) => {
    try {
      if (window.confirm("Do you want to remove this student")) {
        await Axios.post(`/subject/${subjectId}/remove-student/${studentId}`);
        toast.success("student removed");
        navigate(0);
      }
    } catch (error: any) {
      console.log(error.response);
      toast.error("something went wrong");
    }
  };
  useEffect(() => {
    getSubject();
    getClasses();
  }, []);

  if (loading) {
    return <Loading />;
  }
  return (
    <div className="max-w-4xl mx-auto p-6 ">
      {subject && (
        <div>
          <h1 className="text-3xl font-bold mb-4">{subject?.name}</h1>
          <p className="text-lg mb-2">Teacher: {subject?.teacher?.name}</p>
          <p className="text-lg mb-2">Class: {subject?.class?.name}</p>

          <h2 className="text-2xl font-bold mb-4">
            Students {subject?.students?.length}{" "}
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admission Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subject?.students.map((student: any, index: number) => (
                  <tr
                    key={student._id}
                    className="hover:bg-gray-100 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {student.admissionNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {student.class.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600 cursor-pointer hover:text-red-400">
                      <button
                        onClick={() => handleRemove(student._id)}
                        className="flex items-center"
                      >
                        <XCircleIcon className="w-5 h-5 mr-1" />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <p className="mb-4 font-bold">Add new students to this subject.</p>
            <select
              value={selectedClass}
              onChange={handleClassChange}
              className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select a class</option>
              {classes.map((cls, ind) => (
                <option value={cls._id} key={ind}>
                  {cls.name}
                </option>
              ))}
            </select>
            {classStudents.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={toggleSelectAll}
                  className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  {allSelected ? "Deselect All" : "Select All"}
                </button>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {renderStudentOptions()}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={addStudents}
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}

export default ManageSubject;
