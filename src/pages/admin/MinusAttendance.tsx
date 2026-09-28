import React, { useEffect, useRef, useState } from "react";
import Axios from "../../Axios";
import toast from "react-hot-toast";
import {
  Minus,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  Download,
  Search,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/userContext";
import * as XLSX from "xlsx";
import {
  authorizeMinusAttendanceDelete,
  deleteAllMinusAttendance,
  formatDeleteSummary,
} from "../../lib/bulkDelete";

interface MinusRecord {
  _id: string;
  student: {
    _id: string;
    name: string;
    admissionNumber: string;
    rollNumber?: number;
  };
  count: number;
  reason?: string;
  recordedBy?: { name: string };
  createdAt: string;
}


const TABS = ["Add Records", "Manage Records"] as const;
type Tab = (typeof TABS)[number];

const MinusAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("Add Records");

  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  const [batchCount, setBatchCount] = useState<number | "">("");
  const [batchReason, setBatchReason] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["admissionNumber", "count", "reason"],
      ["A001", 3, "disciplinary"],
      ["A002", 2, "administrative"],
    ]);
    ws["!cols"] = [{ wch: 20 }, { wch: 10 }, { wch: 25 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Minus Attendance");
    XLSX.writeFile(wb, "minus_attendance_template.xlsx");
  };

  useEffect(() => {
    if (activeTab === "Add Records" && allStudents.length === 0) {
      Axios.get("/student?limit=10000").then(res => setAllStudents(res.data.students || []));
    }
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBatchSubmit = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }
    if (!batchCount || Number(batchCount) < 1) {
      toast.error("Please enter a valid count (≥ 1)");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await Axios.post("/minus-attendance/batch", {
        records: selectedStudents.map((s) => ({
          admissionNumber: s.admissionNumber,
          count: Number(batchCount),
          reason: batchReason,
        })),
      });

      if (data.created > 0) {
        toast.success(`Saved ${data.created} record${data.created > 1 ? "s" : ""}`);
      }
      if (data.errors > 0) {
        toast.error(`${data.errors} record${data.errors > 1 ? "s" : ""} failed`);
      }

      // Reset
      setSelectedStudents([]);
      setBatchCount("");
      setBatchReason("");
      setSearchQuery("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = allStudents
    .filter(s => 
      !selectedStudents.find(selected => selected._id === s._id) &&
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       s.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .slice(0, 30); // show top 30 matches

  // ── Manage Records state ───────────────────────────────────────────
  const [records, setRecords] = useState<MinusRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCount, setEditCount] = useState<number>(0);
  const [editReason, setEditReason] = useState("");

  // ── Delete All state ───────────────────────────────────────────────
  const [adminPassword, setAdminPassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Load all records on mount and tab switch
  useEffect(() => {
    if (activeTab === "Manage Records") fetchAllRecords();
  }, [activeTab]);

  const fetchAllRecords = async () => {
    setLoadingRecords(true);
    try {
      const { data } = await Axios.get("/minus-attendance");
      setRecords(data.records);
    } catch {
      toast.error("Failed to load records");
    } finally {
      setLoadingRecords(false);
    }
  };

  const resetDeleteInputs = () => {
    setAdminPassword("");
    setDeleteConfirmText("");
  };

  const extractAdminPermissionToken = (authorizationData: any) => {
    const tokenCandidates = [
      authorizationData,
      authorizationData?.adminPermissionToken,
      authorizationData?.permissionToken,
      authorizationData?.token,
      authorizationData?.data?.adminPermissionToken,
      authorizationData?.data?.permissionToken,
      authorizationData?.data?.token,
    ];

    return tokenCandidates.find(
      (candidate) => typeof candidate === "string" && candidate.trim().length > 0
    );
  };

  const handleCompleteMinusDelete = async () => {
    if (!adminPassword.trim()) {
      toast.error("Please enter your account password to verify");
      return;
    }

    if (deleteConfirmText.trim().toUpperCase() !== "DELETE ALL") {
      toast.error("Type DELETE ALL to confirm");
      return;
    }

    if (!window.confirm("Are you sure you want to delete all minus attendance records?")) {
      return;
    }

    try {
      setDeleteSubmitting(true);
      const authorizationData = await authorizeMinusAttendanceDelete(adminPassword);
      const adminPermissionToken = extractAdminPermissionToken(authorizationData);

      if (!adminPermissionToken) {
        toast.error("Authorization failed. Please try again.");
        return;
      }

      const data = await deleteAllMinusAttendance({
        adminPermissionToken,
      });
      toast.success(
        formatDeleteSummary(data, 0, "minus record", "minus records")
      );
      resetDeleteInputs();
      fetchAllRecords();
    } catch (error: any) {
      const statusCode = error?.response?.status;
      const apiMessage = error?.response?.data?.message;

      if (statusCode === 401 && apiMessage) {
        toast.error(apiMessage);
      } else if (apiMessage) {
        toast.error(apiMessage);
      } else {
        toast.error("Failed to delete minus records");
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // ── Manage records helpers ─────────────────────────────────────────
  const filteredRecords = records
    .filter((r) => {
      const q = search.toLowerCase();
      return (
        r.student?.name?.toLowerCase().includes(q) ||
        r.student?.admissionNumber?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const rollA = Number(a.student?.rollNumber) || 0;
      const rollB = Number(b.student?.rollNumber) || 0;
      if (rollA !== rollB) return rollA - rollB;
      return (a.student?.name || "").localeCompare(b.student?.name || "");
    });

  const startEdit = (record: MinusRecord) => {
    setEditingId(record._id);
    setEditCount(record.count);
    setEditReason(record.reason || "");
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    try {
      await Axios.patch(`/minus-attendance/${id}`, { count: editCount, reason: editReason });
      toast.success("Updated");
      setEditingId(null);
      fetchAllRecords();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await Axios.delete(`/minus-attendance/${id}`);
      toast.success("Deleted");
      setRecords((prev) => prev.filter((r) => r._id !== id));
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-rose-900 to-slate-900 p-6 sm:p-8 shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/20 rounded-2xl border border-rose-400/20">
              <Minus className="w-8 h-8 text-rose-300" />
            </div>
            <div>
              <p className="text-slate-300 text-xs font-medium mb-1 tracking-wide uppercase">Admin · Attendance Management</p>
              <h1 className="text-3xl font-bold text-white">Minus Attendance</h1>
              <p className="text-slate-300 mt-1 text-sm">
                Record attendance deductions — deducted from each student's total attendance
              </p>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-200 p-1 rounded-xl w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Tab: Add Records ───────────────────────────────────────── */}
        {activeTab === "Add Records" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Add Minus Attendance</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Search and select single or multiple students to apply deductions.
                </p>
              </div>
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
              >
                <Download className="w-4 h-4" />
                Excel Template
              </button>
            </div>

            <div className="space-y-5">
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Minus Count <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={batchCount}
                    onChange={(e) => setBatchCount(e.target.value ? Number(e.target.value) : "")}
                    placeholder="Enter deduction count (e.g. 1)"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Reason <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={batchReason}
                    onChange={(e) => setBatchReason(e.target.value)}
                    placeholder="Enter reason for deduction"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 bg-white"
                  />
                </div>
              </div>

              {/* Search & Select */}
              <div className="relative" ref={searchRef}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Search Students
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Type name or admission number..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 bg-slate-50"
                  />
                </div>
                
                {isDropdownOpen && searchQuery.trim().length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg border border-slate-200 max-h-60 overflow-y-auto">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(student => (
                        <button
                          key={student._id}
                          onClick={() => {
                            setSelectedStudents([...selectedStudents, student]);
                            setSearchQuery("");
                            setIsDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-rose-50 flex items-center justify-between group transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900 group-hover:text-rose-700">{student.name}</p>
                            <p className="text-xs text-slate-500">{student.admissionNumber} {student.class?.name ? `· ${student.class.name}` : ""}</p>
                          </div>
                          <Plus className="w-4 h-4 text-slate-300 group-hover:text-rose-600" />
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-slate-500">No students found.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Students Badges */}
              {selectedStudents.length > 0 && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Selected Students ({selectedStudents.length})
                    </span>
                    <button 
                      onClick={() => setSelectedStudents([])}
                      className="text-xs font-medium text-slate-500 hover:text-rose-600"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedStudents.map(student => (
                      <span key={student._id} className="inline-flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-sm shadow-sm">
                        <span className="font-medium">{student.name}</span>
                        <span className="text-slate-400 text-xs">({student.admissionNumber})</span>
                        <button
                          onClick={() => setSelectedStudents(selectedStudents.filter(s => s._id !== student._id))}
                          className="ml-1 text-slate-400 hover:text-rose-600 focus:outline-none"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleBatchSubmit}
                  disabled={submitting || selectedStudents.length === 0 || !batchCount}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-white text-sm font-semibold hover:bg-rose-700 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {submitting ? "Saving..." : `Submit for ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── Tab: Manage Records ────────────────────────────────────── */}
        {activeTab === "Manage Records" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">All Records</h2>
                <p className="text-sm text-slate-500">{records.length} record{records.length !== 1 ? "s" : ""} total</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or admission no."
                  className="pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 w-64"
                />
              </div>
            </div>

            {loadingRecords ? (
              <p className="text-center text-slate-500 py-8 text-sm">Loading…</p>
            ) : filteredRecords.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-slate-500 text-sm">
                {search ? "No records match your search" : "No minus attendance records yet"}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Roll No.</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Adm. No.</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Minus</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Reason</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">By</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.map((record) => (
                      <tr key={record._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-indigo-600">{record.student?.rollNumber ?? "—"}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{record.student?.name}</td>
                        <td className="px-4 py-3 text-slate-600">{record.student?.admissionNumber}</td>
                        <td className="px-4 py-3">
                          {editingId === record._id ? (
                            <input
                              type="number"
                              min={1}
                              value={editCount}
                              onChange={(e) => setEditCount(Number(e.target.value))}
                              className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-rose-200"
                            />
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 rounded-full px-2.5 py-0.5 text-xs font-bold">
                              <Minus className="w-3 h-3" /> {record.count}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 italic">
                          {editingId === record._id ? (
                            <input
                              type="text"
                              value={editReason}
                              onChange={(e) => setEditReason(e.target.value)}
                              className="w-40 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                              placeholder="optional"
                            />
                          ) : (
                            record.reason || <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                          {dayjs(record.createdAt).format("MMM D, YYYY")}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{record.recordedBy?.name || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            {editingId === record._id ? (
                              <>
                                <button
                                  onClick={() => saveEdit(record._id)}
                                  className="rounded-lg bg-emerald-100 p-1.5 text-emerald-700 hover:bg-emerald-200 transition"
                                  title="Save"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 transition"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(record)}
                                  className="rounded-lg bg-indigo-100 p-1.5 text-indigo-700 hover:bg-indigo-200 transition"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(record._id)}
                                  className="rounded-lg bg-rose-100 p-1.5 text-rose-700 hover:bg-rose-200 transition"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Complete Delete Danger Card */}
            {user?.role === "admin" && (
              <div className="rounded-2xl border border-rose-200 bg-white p-5 sm:p-6 shadow-sm mt-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  Complete Minus Records Delete
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  Deletes all minus attendance records. Password verification is required.
                </p>

                <div className="space-y-4 rounded-xl border border-rose-200 bg-rose-50/40 p-4">
                  <p className="text-sm text-rose-700 font-medium">
                    High-risk action: this permanently deletes all minus attendance records.
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Account Password
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className="block w-full py-2.5 px-3 border border-slate-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 text-sm"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Enter the current password of the logged-in admin account.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Type confirmation: DELETE ALL
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE ALL"
                      className="block w-full py-2.5 px-3 border border-slate-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 text-sm"
                    />
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={handleCompleteMinusDelete}
                    disabled={deleteSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-white text-sm font-semibold hover:bg-rose-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleteSubmitting ? "Deleting..." : "Delete All Minus Records"}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default MinusAttendancePage;
