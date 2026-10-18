import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
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

interface ParsedMinusRow {
  rowNumber: number;
  admissionNumber: string;
  count: number | null;
  rawCount: any;
  reason: string;
  matchedStudent?: any;
  status: "valid" | "error" | "skipped";
  errorReason?: string;
}

const TABS = ["Add Records", "Excel Upload", "Manage Records"] as const;
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

  // ── Excel Upload state ─────────────────────────────────────────────
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedMinusRow[]>([]);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [isUploadingExcel, setIsUploadingExcel] = useState(false);
  const [previewFilter, setPreviewFilter] = useState<"all" | "valid" | "error">("all");
  const [uploadSuccessSummary, setUploadSuccessSummary] = useState<{
    created: number;
    errors: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Template download handlers ──────────────────────────────────────
  const downloadBlankTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["admissionNumber", "count", "reason", "studentName", "rollNumber"],
      ["A001", 3, "disciplinary deduction", "Sample Student 1", 1],
      ["A002", 1, "uniform violation", "Sample Student 2", 2],
    ]);
    ws["!cols"] = [
      { wch: 20 },
      { wch: 10 },
      { wch: 26 },
      { wch: 22 },
      { wch: 12 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Minus Attendance");
    XLSX.writeFile(wb, "minus_attendance_template.xlsx");
    toast.success("Downloaded blank Excel template");
  };

  const downloadStudentTemplate = async () => {
    let pool = allStudents;
    if (pool.length === 0) {
      try {
        const res = await Axios.get("/student?limit=10000");
        pool = res.data.students || [];
        setAllStudents(pool);
      } catch {
        toast.error("Failed to load students for template");
        return;
      }
    }

    const sorted = [...pool].sort((a, b) => {
      const rollA = Number(a.rollNumber) || 0;
      const rollB = Number(b.rollNumber) || 0;
      if (rollA !== rollB) return rollA - rollB;
      return (a.name || "").localeCompare(b.name || "");
    });

    const rows = sorted.map((s) => ({
      admissionNumber: s.admissionNumber || "",
      studentName: s.name || "",
      rollNumber: s.rollNumber ?? "",
      className: s.class?.name || "",
      count: "",
      reason: "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 20 },
      { wch: 24 },
      { wch: 12 },
      { wch: 16 },
      { wch: 12 },
      { wch: 26 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Active Students");
    XLSX.writeFile(wb, "minus_attendance_with_students.xlsx");
    toast.success(`Exported template with ${rows.length} enrolled students`);
  };

  useEffect(() => {
    if ((activeTab === "Add Records" || activeTab === "Excel Upload") && allStudents.length === 0) {
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

  // ── Excel Upload handlers & helpers ────────────────────────────────
  const handleExcelFileSelect = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error("Please upload an Excel or CSV file (.xlsx, .xls, .csv)");
      return;
    }

    setExcelFile(file);
    setUploadSuccessSummary(null);
    setIsParsingExcel(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const wb = XLSX.read(buffer, { type: "array" });
        const firstSheetName = wb.SheetNames[0];
        if (!firstSheetName) {
          toast.error("The Excel file has no sheets");
          setIsParsingExcel(false);
          return;
        }

        const ws = wb.Sheets[firstSheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(ws);

        if (jsonRows.length === 0) {
          toast.error("The Excel file has no data rows");
          setIsParsingExcel(false);
          return;
        }

        let studentPool = allStudents;
        if (studentPool.length === 0) {
          try {
            const res = await Axios.get("/student?limit=10000");
            studentPool = res.data.students || [];
            setAllStudents(studentPool);
          } catch {
            // ignore
          }
        }

        const studentMap = new Map<string, any>();
        studentPool.forEach((s) => {
          if (s.admissionNumber) {
            studentMap.set(String(s.admissionNumber).trim().toLowerCase(), s);
          }
        });

        const parsed: ParsedMinusRow[] = [];

        jsonRows.forEach((row, idx) => {
          const rowNumber = idx + 2;
          const rawAdm =
            row.admissionNumber ||
            row["Admission Number"] ||
            row["admission_number"] ||
            row["Admission No"] ||
            row["admission no"] ||
            row["Adm No"] ||
            row["Adm. No."] ||
            row["admNo"];

          const rawCount =
            row.count !== undefined
              ? row.count
              : row.Count !== undefined
              ? row.Count
              : row.minus !== undefined
              ? row.minus
              : row.Minus !== undefined
              ? row.Minus
              : row["Minus Count"] !== undefined
              ? row["Minus Count"]
              : row.deduction !== undefined
              ? row.deduction
              : row.Deduction;

          const reason =
            row.reason ||
            row.Reason ||
            row.remarks ||
            row.Remarks ||
            "";

          if (!rawAdm) {
            if (rawCount !== undefined && rawCount !== "" && rawCount !== null) {
              parsed.push({
                rowNumber,
                admissionNumber: "",
                count: Number(rawCount),
                rawCount,
                reason: String(reason || ""),
                status: "error",
                errorReason: "Missing admission number",
              });
            }
            return;
          }

          const admissionNumber = String(rawAdm).trim();

          if (rawCount === undefined || rawCount === null || rawCount === "" || rawCount === 0) {
            parsed.push({
              rowNumber,
              admissionNumber,
              count: null,
              rawCount,
              reason: String(reason || ""),
              status: "skipped",
              errorReason: "No deduction count entered",
            });
            return;
          }

          const count = Number(rawCount);
          if (isNaN(count) || count < 1) {
            parsed.push({
              rowNumber,
              admissionNumber,
              count: null,
              rawCount,
              reason: String(reason || ""),
              status: "error",
              errorReason: "Count must be a whole number ≥ 1",
            });
            return;
          }

          const matched = studentMap.get(admissionNumber.toLowerCase());
          if (!matched) {
            parsed.push({
              rowNumber,
              admissionNumber,
              count,
              rawCount,
              reason: String(reason || ""),
              status: "error",
              errorReason: `Student not found with Adm No '${admissionNumber}'`,
            });
            return;
          }

          parsed.push({
            rowNumber,
            admissionNumber: matched.admissionNumber || admissionNumber,
            count,
            rawCount,
            reason: String(reason || "").trim(),
            matchedStudent: matched,
            status: "valid",
          });
        });

        setParsedRows(parsed);
      } catch (err) {
        console.error("Error parsing Excel:", err);
        toast.error("Failed to parse Excel file. Please verify the format.");
      } finally {
        setIsParsingExcel(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const clearExcelUpload = () => {
    setExcelFile(null);
    setParsedRows([]);
    setUploadSuccessSummary(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validRecords = parsedRows.filter((r) => r.status === "valid");
  const errorRecords = parsedRows.filter((r) => r.status === "error");
  const skippedRecords = parsedRows.filter((r) => r.status === "skipped");

  const filteredPreviewRows = useMemo(() => {
    if (previewFilter === "valid") return validRecords;
    if (previewFilter === "error") return errorRecords;
    return parsedRows;
  }, [parsedRows, previewFilter, validRecords, errorRecords]);

  const handleUploadExcelSubmit = async () => {
    if (validRecords.length === 0) {
      toast.error("No valid records to upload");
      return;
    }

    setIsUploadingExcel(true);
    try {
      const { data } = await Axios.post("/minus-attendance/batch", {
        records: validRecords.map((r) => ({
          admissionNumber: r.admissionNumber,
          count: r.count,
          reason: r.reason,
        })),
      });

      if (data.created > 0) {
        toast.success(`Successfully added ${data.created} minus record${data.created > 1 ? "s" : ""}!`);
      }
      if (data.errors > 0) {
        toast.error(`${data.errors} record${data.errors > 1 ? "s" : ""} failed on the server`);
      }

      setUploadSuccessSummary({
        created: data.created || 0,
        errors: data.errors || 0,
      });

      setExcelFile(null);
      setParsedRows([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchAllRecords();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Excel upload failed");
    } finally {
      setIsUploadingExcel(false);
    }
  };

  const handleExportRecords = () => {
    if (records.length === 0) {
      toast.error("No minus records to export");
      return;
    }

    const rows = filteredRecords.map((r) => ({
      "Roll No": r.student?.rollNumber ?? "—",
      "Student Name": r.student?.name || "—",
      "Admission No": r.student?.admissionNumber || "—",
      "Minus Count": r.count,
      "Reason": r.reason || "—",
      "Date": dayjs(r.createdAt).format("MMM D, YYYY"),
      "Recorded By": r.recordedBy?.name || "—",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 10 },
      { wch: 24 },
      { wch: 18 },
      { wch: 14 },
      { wch: 26 },
      { wch: 16 },
      { wch: 20 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Minus Attendance");
    XLSX.writeFile(wb, "minus_attendance_records.xlsx");
    toast.success(`Exported ${rows.length} minus record(s) to Excel`);
  };

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
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={downloadBlankTemplate}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-700 text-sm font-medium hover:bg-slate-50 transition shadow-sm"
                  title="Download blank Excel template"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  Excel Template
                </button>
                <button
                  onClick={downloadStudentTemplate}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-700 text-sm font-medium hover:bg-slate-50 transition shadow-sm"
                  title="Download template pre-filled with all enrolled students"
                >
                  <FileSpreadsheet className="w-4 h-4 text-rose-500" />
                  Template with Students
                </button>
                <button
                  onClick={() => setActiveTab("Excel Upload")}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-white text-sm font-semibold hover:bg-rose-700 transition shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  Upload Excel
                </button>
              </div>
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

              {/* Quick Bulk Excel Callout Banner */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Prefer uploading from an Excel spreadsheet?</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Download our Excel template, fill in your deductions, and upload in bulk with live validation.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("Excel Upload")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-semibold hover:bg-slate-800 transition shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" /> Go to Excel Upload
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── Tab: Excel Upload ───────────────────────────────────────── */}
        {activeTab === "Excel Upload" && (
          <section className="space-y-6">
            {/* Top guide & template download card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-2 border border-rose-100">
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Bulk Excel Import
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Upload Minus Attendance via Excel</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Download a template, enter student deductions, and upload the spreadsheet for instant validation and import.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={downloadBlankTemplate}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-700 text-sm font-medium hover:bg-slate-50 transition shadow-sm"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    Blank Template
                  </button>
                  <button
                    onClick={downloadStudentTemplate}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-rose-700 text-sm font-medium hover:bg-rose-100 transition shadow-sm"
                  >
                    <Download className="w-4 h-4 text-rose-600" />
                    Template with Students
                  </button>
                </div>
              </div>

              {/* 3 Step Instruction cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Download Template</p>
                    <p className="text-xs text-slate-500 mt-0.5">Use blank template or one pre-filled with all enrolled students.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Enter Deductions</p>
                    <p className="text-xs text-slate-500 mt-0.5">Fill in <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-rose-600 font-mono">count</code> (≥ 1) and optional <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-700 font-mono">reason</code>.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Review & Save</p>
                    <p className="text-xs text-slate-500 mt-0.5">Upload, inspect live matched student previews, and click Upload.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dropzone & file selector */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleExcelFileSelect(file);
                }}
                className="hidden"
                id="excel-file-upload-input"
              />

              {!excelFile && (
                <label
                  htmlFor="excel-file-upload-input"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleExcelFileSelect(file);
                  }}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/30 hover:bg-rose-50/70 p-8 sm:p-12 text-center cursor-pointer transition-colors group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border border-rose-200 shadow-sm flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    {isParsingExcel ? (
                      <div className="w-6 h-6 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-7 h-7 text-rose-600" />
                    )}
                  </div>
                  <p className="text-base font-semibold text-slate-800">
                    {isParsingExcel ? "Analyzing spreadsheet data..." : "Click to select or drag & drop Excel file"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv)
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-semibold hover:bg-slate-800 shadow-sm">
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Select Spreadsheet File
                  </div>
                </label>
              )}

              {excelFile && (
                <div className="space-y-4">
                  {/* File info bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{excelFile.name}</p>
                        <p className="text-xs text-slate-500">
                          {(excelFile.size / 1024).toFixed(1)} KB · {parsedRows.length} rows detected
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="excel-file-upload-input"
                        className="cursor-pointer text-xs font-medium text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
                      >
                        Change File
                      </label>
                      <button
                        onClick={clearExcelUpload}
                        className="text-xs font-medium text-rose-600 bg-white border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Metrics stat cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                      <p className="text-xs font-medium text-slate-500">Total Rows</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{parsedRows.length}</p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                      <p className="text-xs font-medium text-emerald-700">Valid to Import</p>
                      <p className="text-2xl font-bold text-emerald-700 mt-1">{validRecords.length}</p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50">
                      <p className="text-xs font-medium text-rose-700">Errors</p>
                      <p className="text-2xl font-bold text-rose-700 mt-1">{errorRecords.length}</p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                      <p className="text-xs font-medium text-slate-500">Skipped (0/blank)</p>
                      <p className="text-2xl font-bold text-slate-600 mt-1">{skippedRecords.length}</p>
                    </div>
                  </div>

                  {/* Warning banner if errors exist */}
                  {errorRecords.length > 0 && (
                    <div className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">{errorRecords.length} record{errorRecords.length > 1 ? "s" : ""} have errors</span> (e.g. unknown admission number or invalid count) and will be skipped. Only the {validRecords.length} valid record{validRecords.length !== 1 ? "s" : ""} will be imported.
                      </div>
                    </div>
                  )}

                  {/* Filter tabs for preview table */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                      <button
                        onClick={() => setPreviewFilter("all")}
                        className={`px-3 py-1 rounded-md font-medium transition ${previewFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                      >
                        All ({parsedRows.length})
                      </button>
                      <button
                        onClick={() => setPreviewFilter("valid")}
                        className={`px-3 py-1 rounded-md font-medium transition ${previewFilter === "valid" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-emerald-700"}`}
                      >
                        Valid ({validRecords.length})
                      </button>
                      <button
                        onClick={() => setPreviewFilter("error")}
                        className={`px-3 py-1 rounded-md font-medium transition ${previewFilter === "error" ? "bg-white text-rose-700 shadow-sm" : "text-slate-600 hover:text-rose-700"}`}
                      >
                        Errors ({errorRecords.length})
                      </button>
                    </div>
                    <span className="text-xs text-slate-400">
                      Showing {filteredPreviewRows.length} of {parsedRows.length} rows
                    </span>
                  </div>

                  {/* Interactive preview table */}
                  <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-96 overflow-y-auto">
                    <table className="min-w-full text-xs">
                      <thead className="bg-slate-100 sticky top-0 z-10">
                        <tr>
                          <th className="px-3.5 py-2.5 text-left font-semibold text-slate-600 uppercase tracking-wider">Excel Row</th>
                          <th className="px-3.5 py-2.5 text-left font-semibold text-slate-600 uppercase tracking-wider">Roll No</th>
                          <th className="px-3.5 py-2.5 text-left font-semibold text-slate-600 uppercase tracking-wider">Student Name</th>
                          <th className="px-3.5 py-2.5 text-left font-semibold text-slate-600 uppercase tracking-wider">Adm No</th>
                          <th className="px-3.5 py-2.5 text-left font-semibold text-slate-600 uppercase tracking-wider">Minus Count</th>
                          <th className="px-3.5 py-2.5 text-left font-semibold text-slate-600 uppercase tracking-wider">Reason</th>
                          <th className="px-3.5 py-2.5 text-left font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredPreviewRows.map((r, i) => (
                          <tr key={i} className={`hover:bg-slate-50 ${r.status === "error" ? "bg-rose-50/30" : r.status === "skipped" ? "bg-slate-50/40 text-slate-400" : ""}`}>
                            <td className="px-3.5 py-2 font-mono text-slate-500">#{r.rowNumber}</td>
                            <td className="px-3.5 py-2 font-bold text-indigo-600">{r.matchedStudent?.rollNumber ?? "—"}</td>
                            <td className="px-3.5 py-2 font-medium text-slate-800">
                              {r.matchedStudent?.name || <span className="text-rose-500 italic">Unknown student</span>}
                              {r.matchedStudent?.class?.name && <span className="text-slate-400 text-[10px] ml-1">({r.matchedStudent.class.name})</span>}
                            </td>
                            <td className="px-3.5 py-2 font-mono text-slate-700">{r.admissionNumber || "—"}</td>
                            <td className="px-3.5 py-2">
                              {r.count !== null ? (
                                <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                                  <Minus className="w-2.5 h-2.5" /> {r.count}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="px-3.5 py-2 text-slate-600 max-w-[150px] truncate" title={r.reason}>
                              {r.reason || <span className="text-slate-400 italic">—</span>}
                            </td>
                            <td className="px-3.5 py-2">
                              {r.status === "valid" ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Valid
                                </span>
                              ) : r.status === "error" ? (
                                <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md font-medium" title={r.errorReason}>
                                  <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" /> {r.errorReason}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                  Skipped
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Upload action buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={clearExcelUpload}
                      disabled={isUploadingExcel}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
                    >
                      Clear & Reset
                    </button>
                    <button
                      onClick={handleUploadExcelSubmit}
                      disabled={isUploadingExcel || validRecords.length === 0}
                      className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-white text-sm font-semibold hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      <Upload className="w-4 h-4" />
                      {isUploadingExcel ? "Uploading..." : `Upload ${validRecords.length} Minus Record${validRecords.length !== 1 ? "s" : ""}`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Success card if uploaded */}
            {uploadSuccessSummary && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Upload Completed Successfully!</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Recorded <span className="font-semibold text-emerald-800">{uploadSuccessSummary.created}</span> minus attendance record{uploadSuccessSummary.created !== 1 ? "s" : ""}.
                      {uploadSuccessSummary.errors > 0 && ` (${uploadSuccessSummary.errors} failed on the server)`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setUploadSuccessSummary(null);
                      setActiveTab("Manage Records");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
                  >
                    View in Manage Records <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
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
              <div className="flex items-center gap-2">
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
                <button
                  onClick={handleExportRecords}
                  disabled={records.length === 0}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-700 text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50 shadow-sm"
                  title="Export to Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Export Excel
                </button>
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
