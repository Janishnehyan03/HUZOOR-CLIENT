import { useEffect, useState } from "react";
import Axios from "../../Axios";
import toast from "react-hot-toast";

// Define the types for props
interface CreateTeacherProps {
  setIsOpen: (isOpen: boolean) => void;
  selectedTeacher: {
    _id: string;
    name: string;
    serialNumber?: string;
  } | null;
  refreshTeachers: () => void;
}

const CreateTeacher: React.FC<CreateTeacherProps> = ({
  setIsOpen,
  selectedTeacher,
  refreshTeachers,
}) => {
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (selectedTeacher) {
      setName(selectedTeacher.name || "");
      setPassword(""); // Clear password field for editing
    } else {
      setName("");
      setPassword("");
    }
  }, [selectedTeacher]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTeacher && (!password || password.trim().length < 6)) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password && password.trim().length > 0 && password.trim().length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    const payload: any = { name: name.trim() };
    if (password && password.trim() !== "") {
      payload.password = password.trim();
    }

    try {
      if (selectedTeacher) {
        await Axios.patch(`/teacher/${selectedTeacher._id}`, payload);
        toast.success("Teacher profile and password updated!");
      } else {
        await Axios.post("/teacher", payload);
        toast.success("Teacher created successfully!");
      }
      refreshTeachers();
      setIsOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {selectedTeacher ? "Edit Teacher" : "Create New Teacher"}
              </h2>
              {selectedTeacher?.serialNumber && (
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Serial No: {selectedTeacher.serialNumber}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Teacher Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-slate-900 text-sm"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  {selectedTeacher ? "New Login Password" : "Login Password"}
                </label>
                {selectedTeacher && (
                  <span className="text-[11px] font-medium text-slate-400">
                    Optional
                  </span>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!selectedTeacher}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-slate-900 text-sm"
                placeholder={
                  selectedTeacher
                    ? "Leave blank to keep current password"
                    : "Enter password (min 6 chars)"
                }
              />
              {selectedTeacher && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Enter a new password here if you want to reset this teacher's login credentials.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-sm font-semibold shadow-md disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : selectedTeacher
                ? "Update Teacher"
                : "Create Teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeacher;
