import { useState, useEffect } from "react";
import Axios from "../../Axios";
import { CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Teacher {
  _id: string;
  name: string;
  serialNumber: string;
  isActive: boolean;
}

const TeachersList = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await Axios.get("/teacher");
        if (response.data?.teachers) {
          setTeachers(response.data.teachers);
        }
      } catch (error) {
        console.error("Failed to fetch teachers", error);
        toast.error("Failed to load teachers list");
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <section className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 shadow-md">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Teachers Availability
            </h1>
            <p className="text-slate-200 mt-2 text-sm sm:text-base">
              Check which teachers are currently active and available.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          {loading ? (
            <div className="flex justify-center p-12 text-slate-500">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachers.map((teacher) => (
                <div
                  key={teacher._id}
                  className="p-4 border rounded-xl flex items-center justify-between shadow-sm bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {teacher.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 line-clamp-1">{teacher.name}</h3>
                      <p className="text-xs text-slate-500">{teacher.serialNumber}</p>
                    </div>
                  </div>
                  <div>
                    {teacher.isActive !== false ? (
                      <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-md text-xs font-semibold">
                        <XCircle className="w-3 h-3" />
                        Inactive
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {teachers.length === 0 && (
                <div className="col-span-full text-center text-slate-500 py-8">
                  No teachers found.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TeachersList;
