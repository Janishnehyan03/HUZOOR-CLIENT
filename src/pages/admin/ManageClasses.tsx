// ManageClasses.js
import { useEffect, useState } from "react";
import Axios from "../../Axios";
import CreateClass from "./components/CreateClass";
import EditClass from "./components/EditClass";

const ManageClasses = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);

  useEffect(() => {
    // Fetch the list of subjects
    Axios.get("/class").then((response) => {
      setClasses(response.data.classes);
    });
  }, [isOpen]);

  return (
    <div className="p-4 bg-green-50 min-h-screen">
      {isOpen && <CreateClass setIsOpen={setIsOpen} />}
      {isOpenEdit && (
        <>
          {selectedClass && (
            <EditClass
              setIsOpen={setIsOpenEdit}
              selectedClass={selectedClass}
            />
          )}
        </>
      )}

      <div className="bg-green-100 h-screen m-3 p-4 rounded-2xl">
        <div className="flex justify-around items-center">
          <h1 className="text-3xl font-bold mb-5 text-center text-green-800">
            Manage Classes
          </h1>

          <button
            onClick={() => setIsOpen(true)}
            className="bg-primary text-white px-2 py-1 font-semibold border border-primary hover:bg-transparent hover:text-primary"
          >
            Create Class
          </button>
        </div>

        {classes.length > 0 && (
          <div className="overflow-x-auto max-w-2xl mx-auto mt-3">
            <table className="min-w-full bg-white shadow rounded-lg">
              <thead>
                <tr className="bg-green-200">
                  <th className="py-2 px-4 border-b">Class Name</th>
                  <th className="py-2 px-4 border-b">Edit</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((classItem, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-gray-200"}
                  >
                    <td className="py-2 px-4 border-b">{classItem.name}</td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => {
                          setSelectedClass(classItem._id);
                          setIsOpenEdit(true);
                        }}
                        className="bg-primary text-white px-2 py-1 border border-primary "
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageClasses;
