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
import * as XLSX from "xlsx";

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

interface EntryRow {
  id: number;
  admissionNumber: string;
  studentName: string;
  studentId: string;
  count: number | string;
  reason: string;
  status: "idle" | "loading" | "found" | "notfound";
}

const TABS = ["Add Records", "Manage Records"] as const;
type Tab = (typeof TABS)[number];

const MinusAttendancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Add Records");

  // ── Add Records state ──────────────────────────────────────────────
  const nextId = useRef(1);
  const [rows, setRows] = useState<EntryRow[]>([
    { id: nextId.current++, admissionNumber: "", studentName: "", studentId: "", count: "", reason: "", status: "idle" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  // ── Manage Records state ───────────────────────────────────────────
  const [records, setRecords] = useState<MinusRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCount, setEditCount] = useState<number>(0);
  const [editReason, setEditReason] = useState("");

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

  // ── Entry row helpers ──────────────────────────────────────────────
  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: nextId.current++, admissionNumber: "", studentName: "", studentId: "", count: "", reason: "", status: "idle" },
    ]);
  };

  const removeRow = (id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (id: number, field: Partial<EntryRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...field } : r)));
  };

  const lookupStudent = async (rowId: number, admissionNumber: string) => {
    const trimmed = admissionNumber.trim();
    if (!trimmed) return;
    updateRow(rowId, { status: "loading", studentName: "", studentId: "" });
    try {
      const { data } = await Axios.get(`/student?admissionNumber=${encodeURIComponent(trimmed)}`);
      const student = data.students?.[0];
      if (student) {
        updateRow(rowId, { status: "found", studentName: student.name, studentId: student._id });
      } else {
        updateRow(rowId, { status: "notfound", studentName: "", studentId: "" });
      }
    } catch {
      updateRow(rowId, { status: "notfound", studentName: "", studentId: "" });
    }
  };

  const handleAdmissionBlur = (rowId: number, value: string) => {
    lookupStudent(rowId, value);
  };

  const handleSubmitAll = async () => {
    const validRows = rows.filter((r) => r.status === "found" && Number(r.count) >= 1);
    if (validRows.length === 0) {
      toast.error("No valid rows to submit. Make sure admission numbers are resolved and counts are ≥ 1.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await Axios.post("/minus-attendance/batch", {
        records: validRows.map((r) => ({
          admissionNumber: r.admissionNumber.trim(),
          count: Number(r.count),
          reason: r.reason,
        })),
      });

      if (data.created > 0) {
        toast.success(`Saved ${data.created} record${data.created > 1 ? "s" : ""}`);
      }
      if (data.errors > 0) {
        toast.error(`${data.errors} record${data.errors > 1 ? "s" : ""} failed`);
      }

      // Reset rows
      nextId.current = 1;
      setRows([{ id: nextId.current++, admissionNumber: "", studentName: "", studentId: "", count: "", reason: "", status: "idle" }]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Excel template download ────────────────────────────────────────
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

  // ── Manage records helpers ─────────────────────────────────────────
  const filteredRecords = records.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.student?.name?.toLowerCase().includes(q) ||
      r.student?.admissionNumber?.toLowerCase().includes(q)
    );
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

  const validRowCount = rows.filter((r) => r.status === "found" && Number(r.count) >= 1).length;

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
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Add by Admission Number</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Enter admission numbers — names are fetched automatically.
                </p>
              </div>
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
            </div>

            {/* Entry table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left pb-2 pr-3 font-medium text-slate-600 w-40">Admission No.</th>
                    <th className="text-left pb-2 pr-3 font-medium text-slate-600 min-w-[160px]">Student Name</th>
                    <th className="text-left pb-2 pr-3 font-medium text-slate-600 w-24">Count</th>
                    <th className="text-left pb-2 pr-3 font-medium text-slate-600 min-w-[160px]">Reason (optional)</th>
                    <th className="pb-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="py-2 pr-3">
                        <input
                          type="text"
                          value={row.admissionNumber}
                          onChange={(e) => updateRow(row.id, { admissionNumber: e.target.value, status: "idle", studentName: "", studentId: "" })}
                          onBlur={(e) => handleAdmissionBlur(row.id, e.target.value)}
                          placeholder="e.g. A001"
                          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2 min-h-[34px]">
                          {row.status === "loading" && (
                            <span className="text-slate-400 text-xs">Fetching…</span>
                          )}
                          {row.status === "found" && (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span className="text-slate-800 font-medium">{row.studentName}</span>
                            </>
                          )}
                          {row.status === "notfound" && (
                            <>
                              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                              <span className="text-rose-600 text-xs">Not found</span>
                            </>
                          )}
                          {row.status === "idle" && !row.admissionNumber && (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="number"
                          min={1}
                          value={row.count}
                          onChange={(e) => updateRow(row.id, { count: e.target.value })}
                          placeholder="0"
                          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-rose-200"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="text"
                          value={row.reason}
                          onChange={(e) => updateRow(row.id, { reason: e.target.value })}
                          placeholder="optional"
                          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                        />
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => removeRow(row.id)}
                          disabled={rows.length === 1}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={addRow}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <Plus className="w-4 h-4" /> Add Row
              </button>

              <button
                onClick={handleSubmitAll}
                disabled={submitting || validRowCount === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-white text-sm font-medium hover:bg-rose-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {submitting ? "Saving…" : `Submit ${validRowCount > 0 ? `(${validRowCount})` : ""}`}
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Tip: Tab out of an admission number field to auto-fetch the student name. Only rows with a resolved name and count ≥ 1 will be submitted.
            </p>
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
          </section>
        )}
      </div>
    </div>
  );
};

export default MinusAttendancePage;
