import { Layers, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Axios from "../../Axios";
import { bulkDelete, formatDeleteSummary } from "../../lib/bulkDelete";
import CreateClass from "./components/CreateClass.tsx";
import EditClass from "./components/EditClass.tsx";

const ManageClasses = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [deletingSelected, setDeletingSelected] = useState(false);

  useEffect(() => {
    Axios.get("/class").then((response) => {
      setClasses(response.data.classes);
      setSelectedClassIds([]);
    });
  }, [isOpen]);

  const handleDelete = async (classId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this class?"
    );
    if (confirmDelete) {
      try {
        await Axios.delete(`/class/${classId}`);
        setClasses(classes.filter((classItem) => classItem._id !== classId));
        setSelectedClassIds((prev) => prev.filter((id) => id !== classId));
        alert("Class deleted successfully!");
      } catch (error) {
        console.error("Failed to delete class:", error);
        alert("Error deleting class. Please try again.");
      }
    }
  };

  const allVisibleClassIds = classes
    .map((classItem) => classItem._id)
    .filter((classId): classId is string => Boolean(classId));

  const allVisibleSelected =
    allVisibleClassIds.length > 0 &&
    allVisibleClassIds.every((classId) => selectedClassIds.includes(classId));

  const handleSelectVisible = () => {
    if (allVisibleSelected) {
      setSelectedClassIds((prev) =>
        prev.filter((id) => !allVisibleClassIds.includes(id))
      );
      return;
    }

    setSelectedClassIds((prev) => Array.from(new Set([...prev, ...allVisibleClassIds])));
  };

  const handleSelectClass = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

  const handleBulkDeleteClasses = async () => {
    if (!selectedClassIds.length) return;

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedClassIds.length} selected classes?`
      )
    ) {
      return;
    }

    try {
      setDeletingSelected(true);
      const data = await bulkDelete("class", selectedClassIds);
      const response = await Axios.get("/class");
      setClasses(response.data.classes);
      setSelectedClassIds([]);
      toast.success(
        formatDeleteSummary(data, selectedClassIds.length, "class", "classes")
      );
    } catch (error) {
      console.error("Failed to bulk delete classes:", error);
      toast.error("Failed to delete selected classes.");
    } finally {
      setDeletingSelected(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-8">
      {isOpen && <CreateClass setIsOpen={setIsOpen} />}
      {isOpenEdit && selectedClass && (
        <EditClass setIsOpen={setIsOpenEdit} selectedClass={selectedClass} />
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 p-6 sm:p-8 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-slate-300 text-xs sm:text-sm font-medium mb-2 tracking-wide">
                CORE OPS
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                Manage Classes
              </h1>
              <p className="text-slate-200 mt-2 text-sm sm:text-base">
                Create, update, and organize classroom structures with better
                visibility.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/20 px-5 py-4 min-w-[220px] shadow-inner">
              <p className="text-xs uppercase tracking-wide text-slate-300">
                Total Classes
              </p>
              <p className="mt-1 text-white text-3xl font-bold">{classes.length}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Class List</h2>
              <p className="text-sm text-slate-500 mt-1">
                Maintain class names and serial ordering.
              </p>
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-indigo-700 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Create Class
            </button>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleBulkDeleteClasses}
              disabled={!selectedClassIds.length || deletingSelected}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-white text-sm font-medium hover:bg-rose-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {deletingSelected
                ? "Deleting..."
                : `Delete Selected (${selectedClassIds.length})`}
            </button>
          </div>

          {classes.length > 0 ? (
            <div className="overflow-x-auto mt-6 rounded-xl border border-slate-200">
              <table className="min-w-full bg-white text-left">
                <thead className="bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wide">
                  <tr>
                    <th className="py-3 px-6">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={handleSelectVisible}
                        disabled={!allVisibleClassIds.length}
                        className="h-4 w-4 accent-indigo-600"
                        aria-label="Select all visible classes"
                      />
                    </th>
                    <th className="py-3 px-6">Class Name</th>
                    <th className="py-3 px-6">Serial Number</th>
                    <th className="py-3 px-6">Edit</th>
                    <th className="py-3 px-6">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {classes.map((classItem, index) => (
                    <tr
                      key={classItem._id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50"
                      } hover:bg-indigo-50/50 transition`}
                    >
                      <td className="py-3 px-6">
                        <input
                          type="checkbox"
                          checked={selectedClassIds.includes(classItem._id)}
                          onChange={() => handleSelectClass(classItem._id)}
                          className="h-4 w-4 accent-indigo-600"
                          aria-label={`Select ${classItem.name}`}
                        />
                      </td>
                      <td className="py-3 px-6 text-sm text-slate-800 font-medium">
                        {classItem.name}
                      </td>
                      <td className="py-3 px-6 text-sm text-slate-700">
                        {classItem.serialNumber}
                      </td>
                      <td className="py-3 px-6">
                        <button
                          onClick={() => {
                            setSelectedClass(classItem._id);
                            setIsOpenEdit(true);
                          }}
                          className="rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-indigo-700 transition"
                        >
                          Edit
                        </button>
                      </td>
                      <td className="py-3 px-6">
                        <button
                          onClick={() => handleDelete(classItem._id)}
                          className="rounded-lg bg-rose-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-rose-700 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center mt-6">
              <Layers className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 text-sm sm:text-base">
                No classes available yet. Click “Create Class” to get started.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ManageClasses;
