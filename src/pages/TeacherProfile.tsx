import {
  ArrowLeft,
  BookOpen,
  Key,
  ShieldCheck,
  UploadCloud,
  User,
  Lock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Axios from "../Axios";
import Loading from "../components/Loading";

interface TeacherProfileProps {
  _id: string;
  name: string;
  serialNumber?: string;
  profileImage?: string;
  role: string;
}

const TeacherProfile = () => {
  const { teacherId } = useParams();
  const [teacher, setTeacher] = useState<TeacherProfileProps | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Password reset modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const getTeacher = async () => {
    try {
      setLoading(true);
      const { data } = await Axios.get(`/teacher/${teacherId}`);
      setTeacher(data.teacher);
      setSubjects(data.subjects || []);
    } catch (error: any) {
      console.log(error.response);
      toast.error("Failed to load teacher profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTeacher();
  }, [teacherId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("my_file", selectedFile);

    try {
      const response = await Axios.post(
        `/teacher/upload/${teacherId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Profile picture updated!");
      setTeacher(response.data);
      setSelectedFile(null);
    } catch (error: any) {
      console.log(error.response);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.trim().length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setPasswordLoading(true);
      await Axios.patch(`/teacher/${teacherId}`, {
        password: newPassword.trim(),
      });
      toast.success("Teacher password reset successfully!");
      setShowPasswordModal(false);
      setNewPassword("");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (!teacher) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Teacher Not Found</h2>
        <Link
          to="/teachers"
          className="mt-4 inline-flex items-center gap-2 text-indigo-600 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Teachers
        </Link>
      </div>
    );
  }

  const initial = teacher.name?.charAt(0).toUpperCase() || "T";

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/teachers"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Teachers List
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Cover Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-10 text-white shadow-xl mb-8 border border-slate-800">
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              {teacher.profileImage ? (
                <img
                  className="h-28 w-28 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg"
                  src={teacher.profileImage}
                  alt={teacher.name}
                />
              ) : (
                <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-4xl font-extrabold ring-4 ring-white/20 shadow-lg">
                  {initial}
                </div>
              )}
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span>
            </div>

            {/* Profile Info */}
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-2">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold uppercase tracking-wider">
                  {teacher.role || "Faculty"}
                </span>
                {teacher.serialNumber && (
                  <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-mono">
                    SN: {teacher.serialNumber}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {teacher.name}
              </h1>

              <p className="text-slate-400 text-sm mt-1 flex items-center justify-center sm:justify-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Authorized Faculty Account
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white text-xs font-bold tracking-wide flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Key className="w-4 h-4 text-indigo-300" />
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details & Photo Upload */}
          <div className="space-y-6">
            {/* Account Info Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" /> Profile Details
              </h3>

              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-medium text-slate-500">Full Name</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{teacher.name}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-medium text-slate-500">Serial Number</p>
                  <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                    {teacher.serialNumber || "N/A"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-medium text-slate-500">System Role</p>
                  <p className="text-sm font-bold text-indigo-600 capitalize mt-0.5">
                    {teacher.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Picture Upload Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-indigo-600" /> Update Picture
              </h3>

              <div className="space-y-4">
                <input
                  type="file"
                  id="fileInput"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />

                <button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Save Picture"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Assigned Subjects */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" /> Assigned Subjects
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Courses and curriculum periods assigned to this faculty member.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
                  {subjects.length} Total
                </span>
              </div>

              {subjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {subjects.map((subject: any) => (
                    <div
                      key={subject._id}
                      className="group p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="h-8 w-8 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            <BookOpen className="w-4 h-4" />
                          </span>
                          {subject.class?.name && (
                            <span className="px-2.5 py-0.5 rounded-md bg-slate-200/70 text-slate-700 text-[11px] font-bold">
                              {subject.class.name}
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {subject.name}
                        </h4>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">
                          {subject.students?.length || 0} Students
                        </span>
                        <Link
                          to={`/attendance/${subject._id}`}
                          className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                          Mark Attendance →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No Subjects Assigned</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Assign subjects from the Subjects management section.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Reset Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Change Teacher Password</h3>
                  <p className="text-xs text-slate-500">For {teacher.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 text-sm outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherProfile;
