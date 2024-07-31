import { useEffect, useState } from "react";
import Axios from "../../Axios";
import AddSubjectForm from "./AddSubject";
import Loading from "../../components/Loading";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

function Subjects() {
  const [subjects, setSubjects] = useState<any>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const getSubjects = async () => {
    try {
      setLoading(true);
      let { data } = await Axios.get("/subject");
      setSubjects(data.subjects);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.log(error.response);
    }
  };

  const addSubject = (subject: any) => {
    setSubjects([...subjects, subject]);
  };

  const editSubject = (updatedSubject: any) => {
    setSubjects(
      subjects.map((subject: any) =>
        subject._id === updatedSubject._id ? updatedSubject : subject
      )
    );
  };

  useEffect(() => {
    getSubjects();
  }, []);

  return (
    <div>
      <h1 className="bg-gray-800 p-4 text-white text-center text-2xl font-bold uppercase my-3">
        Subjects
      </h1>
      <div className="flex justify-end m-8">
        <button
          onClick={() => {
            setEditingSubject(null);
            setShowForm(true);
          }}
          className="mb-4 px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75"
        >
          Create New Subject
        </button>
      </div>
      {showForm && (
        <AddSubjectForm
          onClose={() => setShowForm(false)}
          onAdd={addSubject}
          onEdit={editSubject}
          initialData={editingSubject}
        />
      )}
      <div className="flex flex-col m-8">
        <div className="-m-1.5 overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              {loading ? (
                <Loading />
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                      >
                        #
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                      >
                        Class
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase"
                      >
                        Teacher
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase"
                      >
                        Students
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase"
                      >
                        Edit
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase"
                      >
                        Manage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {subjects.length > 0 &&
                      subjects.map((subject: any, index: any) => (
                        <tr key={subject._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {subject.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            {subject?.class?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap ">
                            <div className="flex items-center space-x-3">
                              {subject?.teacher?.profileImage && (
                                <img
                                  src={subject?.teacher?.profileImage}
                                  alt={subject?.teacher?.name}
                                  className="h-16 w-16 object-cover rounded-full"
                                />
                              )}
                              <p className="text-sm text-gray-800 text-center">{subject?.teacher?.name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center">
                            {subject?.students?.length}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSubject(subject);
                                setShowForm(true);
                              }}
                              className="inline-flex bg-blue-950 px-3 py-1 items-center gap-x-2 text-sm font-semibold  text-white border border-transparent  disabled:opacity-50 disabled:pointer-events-none hover:bg-blue-700"
                            >
                              Edit
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                            <Link
                              to={`/subject/${subject._id}`}
                              className="flex items-center"
                            >
                              <div className="flex items-center px-2 py-1 text-white font-semibold bg-teal-700 rounded border border-transparent hover:bg-teal-600">
                                <Settings className="mr-2" />
                                <span>Manage</span>
                              </div>
                            </Link>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Subjects;
