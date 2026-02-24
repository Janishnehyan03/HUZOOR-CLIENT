import { useMemo, useState } from "react";
import Axios from "../../Axios";
import Loading from "../../components/Loading";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import toast from "react-hot-toast";
import {
  CalendarDays,
  CalendarRange,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";

dayjs.extend(localizedFormat);

type ClearanceMode = "single" | "range";

function AttendanceClearance() {
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [student, setStudent] = useState<any>();
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [absentSubjects, setAbsentSubjects] = useState<any[]>([]);
  const [reason, setReason] = useState<"medical" | "official">("medical");
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<ClearanceMode>("single");
  const [selectedDate, setSelectedDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleFetchStudentData = async () => {
    if (!admissionNumber.trim()) {
      toast.error("Please enter admission number");
      return;
    }

    if (mode === "single" && !selectedDate) {
      toast.error("Please select a date");
      return;
    }

    if (mode === "range" && (!startDate || !endDate)) {
      toast.error("Please select start and end date");
      return;
    }

    if (mode === "range" && dayjs(startDate).isAfter(dayjs(endDate))) {
      toast.error("Start date cannot be after end date");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params: any = { admissionNumber };

      if (mode === "single") {
        params.selectedDate = selectedDate;
        params.option = "1";
      } else {
        params.startDate = startDate;
        params.endDate = endDate;
        params.mode = "bulk";
        params.option = "2";
      }

      const { data } = await Axios.get(`/attendance/student/attendances`, {
        params,
      });

      setStudentData(data.attendanceData);
      setStudent(data.student);
      setAbsentSubjects(data.absentSubjects || []);
      setSelectedSubjectIds([]);
    } catch (err) {
      setError("Error fetching student data");
      console.error("Error fetching student data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReasonChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setReason(event.target.value as "medical" | "official");
  };

  const handleSubjectCheckboxChange = (subjectId: string) => {
    const currentIndex = selectedSubjectIds.indexOf(subjectId);
    if (currentIndex === -1) {
      setSelectedSubjectIds([...selectedSubjectIds, subjectId]);
    } else {
      const newSelected = [...selectedSubjectIds];
      newSelected.splice(currentIndex, 1);
      setSelectedSubjectIds(newSelected);
    }
  };

  const uniqueSubjects = useMemo(() => {
    if (absentSubjects.length > 0) {
      return absentSubjects.map((subject: any) => ({
        _id: subject._id,
        name: subject.name || subject._id,
      }));
    }

    if (!studentData) return [];

    return studentData.reduce((unique: any[], attendance: any) => {
      const subjectEntry = attendance?.subject;
      const subjectId =
        typeof subjectEntry === "string"
          ? subjectEntry
          : subjectEntry?._id || subjectEntry?.id;
      const subjectName =
        typeof subjectEntry === "object"
          ? subjectEntry?.name
          : attendance?.subjectName || attendance?.subject?.name;

      if (subjectId && !unique.some((subject) => subject._id === subjectId)) {
        unique.push({
          _id: subjectId,
          name: subjectName || subjectId,
        });
      }

      return unique;
    }, []);
  }, [absentSubjects, studentData]);

  const handleSubmit = async (e: any, studentId: string) => {
    e.preventDefault();

    if (selectedSubjectIds.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }

    if (mode === "single" && !selectedDate) {
      toast.error("Please select a date");
      return;
    }

    if (mode === "range" && (!startDate || !endDate)) {
      toast.error("Please select a valid date range");
      return;
    }

    if (mode === "range" && dayjs(startDate).isAfter(dayjs(endDate))) {
      toast.error("Start date cannot be after end date");
      return;
    }

    const payload: any = {
      admissionNumber,
      reason,
      subjectIds: selectedSubjectIds,
    };

    if (mode === "single") {
      payload.option = "1";
      payload.selectedDate = selectedDate;
    } else {
      payload.option = "2";
      payload.startDate = startDate;
      payload.endDate = endDate;
    }

    setSubmitting(true);
    try {
      const response = await Axios.patch(
        `/attendance/clear/attendance/${studentId}`,
        payload
      );

      if (response.status === 200) {
        toast.success("Attendance cleared successfully");
        window.location.reload();
      }
    } catch (submitError) {
      console.error("Error clearing attendance:", submitError);
      toast.error("Failed to clear attendance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-teal-900 to-slate-900 p-6 sm:p-8 shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-slate-300 text-xs sm:text-sm font-medium mb-2 tracking-wide">
                DAILY FOCUS
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                Attendance Clearance
              </h1>
              <p className="text-slate-200 mt-2 text-sm sm:text-base">
                Select a date scope, fetch absent subjects, and apply official or
                medical clearance with better control.
              </p>
            </div>
            <div className="hidden sm:flex w-11 h-11 rounded-xl bg-white/15 border border-white/20 items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Step 1: Date Scope</h2>

          <div className="flex flex-wrap gap-3 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode("single");
                setStartDate("");
                setEndDate("");
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition ${
                mode === "single"
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Selected Date
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("range");
                setSelectedDate("");
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition ${
                mode === "range"
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
              }`}
            >
              <CalendarRange className="w-4 h-4" />
              Bulk Date Range
            </button>
          </div>

          {mode === "single" ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Selected Date
              </label>
              <input
                type="date"
                className="block w-full py-2.5 px-3 border border-slate-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 text-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  className="block w-full py-2.5 px-3 border border-slate-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  className="block w-full py-2.5 px-3 border border-slate-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 text-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
            <input
              type="text"
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 text-sm"
              placeholder="Enter Student Admission Number"
              value={admissionNumber}
              onChange={(e) => setAdmissionNumber(e.target.value)}
            />
            <button
              onClick={handleFetchStudentData}
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 min-w-[140px] bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition"
              disabled={loading}
            >
              <Search className="w-4 h-4" />
              {loading ? "Fetching..." : "Fetch Data"}
            </button>
          </div>

          {loading && (
            <div className="mt-4">
              <Loading />
            </div>
          )}
          {error && <p className="text-rose-600 mt-4 text-sm">{error}</p>}
        </section>

        {studentData && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <UserRound className="w-5 h-5 text-teal-600" />
                  Student Information
                </h3>
                <p className="text-slate-700 mt-3 text-sm sm:text-base">
                  <span className="font-semibold">Name:</span> {student.name}
                </p>
                <p className="text-slate-700 text-sm sm:text-base">
                  <span className="font-semibold">Class:</span> {student.class.name}
                </p>
                <p className="text-slate-700 text-sm sm:text-base">
                  <span className="font-semibold">Admission Number:</span>{" "}
                  {student.admissionNumber}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Selected Subjects
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {selectedSubjectIds.length}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-slate-900 mb-3">
                Step 2: Select Absent Subjects
              </h4>
              {uniqueSubjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {uniqueSubjects.map((subject: any) => {
                    const isSelected = selectedSubjectIds.includes(subject._id);
                    return (
                      <label
                        key={subject._id}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer transition ${
                          isSelected
                            ? "bg-teal-50 border-teal-300 text-teal-800"
                            : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-teal-600"
                          value={subject._id}
                          checked={isSelected}
                          onChange={() => handleSubjectCheckboxChange(subject._id)}
                        />
                        {subject.name}
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">
                  No absent subjects found for the selected date scope.
                </p>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Step 3: Select Reason
                </label>
                <select
                  className="block w-full py-2.5 px-3 border border-slate-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 text-sm"
                  value={reason}
                  onChange={handleReasonChange}
                >
                  <option value="medical">Medical</option>
                  <option value="official">Official</option>
                </select>
              </div>

              <button
                onClick={(e) => handleSubmit(e, student._id)}
                className="inline-flex items-center justify-center py-2.5 px-5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={submitting || selectedSubjectIds.length === 0}
              >
                {submitting ? "Submitting..." : "Apply Clearance"}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default AttendanceClearance;
