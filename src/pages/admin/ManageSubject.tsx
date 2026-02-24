import { XCircleIcon, BookOpen, Users, UserPlus, Save, CheckSquare, Square } from "lucide-react";
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
    return classStudents.map((student: any) => {
      const isChecked = students.includes(student._id);
      return (
        <div
          key={student._id}
          className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md ${
            isChecked
              ? "bg-indigo-50 border-indigo-300 shadow-sm"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
          onClick={() => handleStudentSelection(student._id)}
        >
          <div className="flex items-center gap-3 flex-1">
            {isChecked ? (
              <CheckSquare className="w-5 h-5 text-indigo-600" />
            ) : (
              <Square className="w-5 h-5 text-slate-400" />
            )}
            <label
              htmlFor={student._id}
              className={`cursor-pointer font-medium ${
                isChecked ? "text-indigo-900" : "text-slate-700"
              }`}
            >
              {student.name}
            </label>
          </div>
          <input
            type="checkbox"
            className="hidden"
            id={student._id}
            value={student._id}
            checked={isChecked}
            onChange={() => handleStudentSelection(student._id)}
          />
        </div>
      );
    });
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
    <div className="max-w-7xl mx-auto px-6 py-8 min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
      {subject && (
        <div>
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8 mb-8 shadow-2xl">
            <div className="absolute inset-0 bg-grid-slate-100/[0.02] [mask-image:radial-gradient(white,transparent_85%)]" />
            <div className="relative">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-indigo-500/20 rounded-2xl backdrop-blur-sm border border-indigo-400/20">
                  <BookOpen className="w-8 h-8 text-indigo-300" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {subject?.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-indigo-200">
                    <p className="text-sm">
                      <span className="font-medium">Teacher:</span>{" "}
                      {subject?.teacher?.name}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Class:</span>{" "}
                      {subject?.class?.name}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Students:</span>{" "}
                      {subject?.students?.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Students Table */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-teal-100 rounded-xl">
                <Users className="w-5 h-5 text-teal-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">
                Enrolled Students ({subject?.students?.length})
              </h2>
            </div>

            {subject?.students?.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Admission Number
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subject?.students.map((student: any, index: number) => (
                      <tr
                        key={student._id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {student.admissionNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {student.class.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleRemove(student._id)}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold transition-colors"
                          >
                            <XCircleIcon className="w-4 h-4" />
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">
                  No students enrolled yet
                </p>
              </div>
            )}
          </div>

          {/* Add New Students Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <UserPlus className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">
                Add New Students
              </h2>
            </div>

            <div className="mb-6">
              <label
                htmlFor="classSelect"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Select Class
              </label>
              <select
                id="classSelect"
                value={selectedClass}
                onChange={handleClassChange}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-slate-900"
              >
                <option value="">Select a class</option>
                {classes.map((cls, ind) => (
                  <option value={cls._id} key={ind}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {classStudents.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-600">
                    {students.length} of {classStudents.length} students
                    selected
                  </p>
                  <button
                    onClick={toggleSelectAll}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                  >
                    {allSelected ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {renderStudentOptions()}
                </div>
              </div>
            )}

            {classStudents.length > 0 && (
              <button
                onClick={addStudents}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageSubject;
