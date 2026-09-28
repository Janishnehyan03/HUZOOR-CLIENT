import dayjs from "dayjs";
import { CalendarDays, Clock3, Edit2Icon, Users, CheckCircle2, BookOpen, Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Axios from "../../../Axios";
import { useAuth } from "../../../contexts/userContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

function TeacherCards() {
  const currentDay = dayjs().format("dddd");
  const currentDate = dayjs().format("MMMM D, YYYY");
  const [subjects, setSubjects] = useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDownloading, setIsDownloading] = useState(false);

  const getMyPeriods = async () => {
    try {
      const { data } = await Axios.get("/subject/get/periods");
      setSubjects(data.subjects || []);
      if (data.subjects && data.subjects.length > 0) {
        setSelectedSubjectId(data.subjects[0]._id);
      }
    } catch (error: any) {
      console.log(error.response);
    }
  };

  function tConvert(time: any) {
    time = time?.toString().match(/^([01]\d|2[0-3]):([0-5]\d)$/) || [time];
    if (time.length > 1) {
      time = time.slice(1);
      let hours = +time[0];
      const minutes = time[1];
      const period = hours < 12 ? "AM" : "PM";
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${period}`;
    }
    return time[0];
  }

  useEffect(() => {
    if (user?.role === "teacher") {
      getMyPeriods();
    }
  }, []);

  const handleDownloadReport = async () => {
    if (!selectedSubjectId) {
      toast.error("Please select a subject");
      return;
    }
    setIsDownloading(true);
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const response = await Axios.get(`/attendance/subject/${selectedSubjectId}/date/${formattedDate}`);
      
      const allAttendances = response.data || [];
      const absentees = allAttendances.filter((a: any) => !a.isPresent);

      if (absentees.length === 0) {
        toast.error("No absentees found for this date and subject.");
        setIsDownloading(false);
        return;
      }

      const selectedSubject = subjects.find(s => s._id === selectedSubjectId);
      const subjectName = selectedSubject ? selectedSubject.name : "Subject";

      const exportData = absentees.map((a: any) => ({
        "Session": a.session || 1,
        "Roll No.": a.student?.rollNumber || "-",
        "Student Name": a.student?.name || "-",
        "Admission No.": a.student?.admissionNumber || "-",
        "Status": a.reason === "medical" ? "Medical" : a.reason === "official" ? "On Duty" : a.reason ? "Leave" : "Absent",
        "Reason": a.reason || "-",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      ws["!cols"] = [{ wch: 10 }, { wch: 10 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 25 }];
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Absentees");
      
      XLSX.writeFile(wb, `absent_report_${subjectName.replace(/\s+/g, "_")}_${formattedDate}.xlsx`);
      toast.success("Report downloaded successfully");
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch report data");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section className="mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-slate-50/60">
      <div className="max-w-7xl mx-auto relative">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-900 p-6 sm:p-10 shadow-xl border border-indigo-600/30 mb-8">
          <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-indigo-100 text-xs font-semibold uppercase tracking-wider mb-3">
                <BookOpen className="w-3.5 h-3.5" /> Faculty Dashboard
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Welcome back, {user?.name || "Teacher"}
              </h1>
              <p className="text-indigo-200 mt-2 flex items-center gap-2 text-sm font-medium">
                <CalendarDays className="w-4 h-4 text-indigo-300" />
                {currentDay}, {currentDate}
              </p>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              {subjects.length} Assigned {subjects.length === 1 ? "Subject" : "Subjects"}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Link
            to="/minus-attendance"
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm py-3 px-6 rounded-xl shadow-xs hover:shadow-md transition-all duration-200"
          >
            Manage Minus Attendance
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold text-sm py-3 px-6 rounded-xl shadow-xs hover:shadow-md transition-all duration-200"
          >
            <Download className="w-4 h-4" /> Download Absent Report
          </button>
        </div>

        {/* Subjects Grid */}
        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {subjects.map((subject: any) => {
              const todaySchedule = subject.dateAndTime?.find(
                (time: any) => time.day.toLowerCase() === currentDay.toLowerCase()
              );

              return (
                <div
                  key={subject._id}
                  className={`group relative rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between ${
                    todaySchedule ? "ring-2 ring-indigo-500/20 border-indigo-300" : ""
                  }`}
                >
                  {todaySchedule && (
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Scheduled Today
                      </span>
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4 gap-3">
                        <div>
                          <h3 className="text-lg font-extrabold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                            {subject.name}
                          </h3>
                          {subject.class?.name && (
                            <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              Class: {subject.class.name}
                            </span>
                          )}
                        </div>

                        <button
                          className="w-8 h-8 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 flex items-center justify-center transition-all"
                          onClick={() => navigate(`/edit-period/${subject._id}`)}
                          aria-label="Edit subject"
                          title="Edit Subject Schedules"
                        >
                          <Edit2Icon size={15} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-5">
                        <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </span>
                        <span className="font-bold text-slate-900">
                          {subject?.students?.length || 0}
                        </span>
                        <span className="text-slate-500">
                          {subject?.students?.length === 1 ? "Student Enrolled" : "Students Enrolled"}
                        </span>
                      </div>

                      {/* Timings */}
                      <div className="space-y-2 mb-6">
                        {subject.dateAndTime?.map((time: any, index: number) => {
                          const isToday = time.day.toLowerCase() === currentDay.toLowerCase();
                          return (
                            <div
                              key={index}
                              className={`p-3 rounded-xl border transition-colors ${
                                isToday
                                  ? "border-indigo-200 bg-indigo-50/70"
                                  : "border-slate-100 bg-slate-50/60"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`font-bold text-xs uppercase tracking-wider ${
                                    isToday ? "text-indigo-700" : "text-slate-600"
                                  }`}
                                >
                                  {time.day}
                                </span>
                                <span
                                  className={`text-xs font-medium flex items-center gap-1 ${
                                    isToday ? "text-indigo-600" : "text-slate-500"
                                  }`}
                                >
                                  <Clock3 className="w-3.5 h-3.5" />
                                  {tConvert(time.startTime)} - {tConvert(time.endTime)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Link
                      to={`/attendance/${subject._id}`}
                      className="block w-full bg-slate-900 hover:bg-indigo-600 text-white text-center font-bold text-sm py-3 px-4 rounded-xl shadow-xs hover:shadow-md transition-all duration-200"
                    >
                      Mark Attendance
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 max-w-xl mx-auto text-center shadow-sm">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">No Subjects Assigned</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              You currently don’t have any subjects assigned to your faculty profile. Please contact your institution administrator.
            </p>
          </div>
        )}
      </div>

      {/* Download Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-600" />
                Download Absent Report
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Class</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"
                >
                  {Array.from(new Map(subjects.filter(s => s.class).map(s => [s.class._id, s])).values()).map((s: any) => (
                    <option key={s._id} value={s._id}>
                      {s.class.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Date</label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date: Date) => setSelectedDate(date)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"
                  dateFormat="MMMM d, yyyy"
                  maxDate={new Date()}
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadReport}
                disabled={isDownloading || subjects.length === 0}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {isDownloading ? (
                  "Downloading..."
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Download Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default TeacherCards;
