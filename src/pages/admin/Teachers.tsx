import { useEffect, useState } from "react";
import Axios from "../../Axios";
import Loading from "../../components/Loading";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import CreateTeacher from "./CreateTeacher";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const getTeachers = async () => {
    setLoading(true);
    try {
      let { data } = await Axios.get("/teacher");
      setLoading(false);
      console.log(data);
      
      setTeachers(data.teachers);
    } catch (error: any) {
      setLoading(false);
      console.log(error.response);
    }
  };

  useEffect(() => {
    getTeachers();
  }, []);

  return (
    <div className="container mx-auto mt-10 p-5 bg-green-50 rounded-lg shadow-lg">
      {isOpen && <CreateTeacher setIsOpen={setIsOpen} />}
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold mb-5 text-center text-green-800">
              Teachers
            </h1>

            <button
              onClick={() => setIsOpen(true)}
              className="bg-primary text-white px-2 py-1 font-semibold border border-primary hover:bg-transparent hover:text-primary"
            >
              Create Teacher{" "}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-green-200">
              <thead className="bg-green-100">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider"
                  >
                    #
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider"
                  >
                    Image
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider"
                  >
                    Profile
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-green-200">
                {teachers.map((teacher: any, index) => (
                  <tr key={teacher._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">
                      {teacher?.profileImage ? (
                        <img
                          src={teacher?.profileImage}
                          className="h-16 w-16 object-cover rounded-full"
                        />
                      ) : (
                        <User className="h-16" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">
                      {teacher.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">
                      {teacher.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">
                      <Link
                        to={`/teacher/${teacher._id}`}
                        className="text-green-600 hover:text-green-800 font-semibold"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Teachers;
