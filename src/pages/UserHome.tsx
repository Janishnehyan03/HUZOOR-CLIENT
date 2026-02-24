import { ArrowRight, Book, Building2, DownloadCloud, User } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const AttendancePage: React.FC = () => {
  const modules = [
    {
      title: "Students",
      description: "Monitor individual student attendance records.",
      icon: <User className="w-5 h-5 text-indigo-700" />,
      iconWrap: "bg-indigo-100",
      link: "/manage-attendance/students",
    },
    {
      title: "Subjects",
      description: "Track attendance performance by subject and class.",
      icon: <Book className="w-5 h-5 text-emerald-700" />,
      iconWrap: "bg-emerald-100",
      link: "/manage-attendance/subjects",
    },
    {
      title: "Departments",
      description: "Review attendance trends at department level.",
      icon: <Building2 className="w-5 h-5 text-amber-700" />,
      iconWrap: "bg-amber-100",
      link: "/manage-attendance/departments",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-6 sm:p-8 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-slate-300 text-xs sm:text-sm font-medium mb-2 tracking-wide">
                DAILY FOCUS
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                Attendance Management
              </h1>
              <p className="text-slate-200 mt-2 text-sm sm:text-base">
                Navigate student, subject, and department attendance insights from
                one unified workspace.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/20 px-5 py-4 min-w-[220px] shadow-inner">
              <p className="text-xs uppercase tracking-wide text-slate-300">
                Modules
              </p>
              <p className="mt-1 text-white text-3xl font-bold">{modules.length}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((module) => (
            <Link to={module.link} key={module.title} className="group">
              <article className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:border-slate-300">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${module.iconWrap}`}
                  >
                    {module.icon}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
                </div>

                <h2 className="text-lg font-semibold text-slate-900 mt-4">
                  {module.title}
                </h2>
                <p className="text-sm text-slate-600 mt-1 leading-6">
                  {module.description}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-sm font-medium text-slate-800">Open Module</span>
                </div>
              </article>
            </Link>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Attendance Clearance Form
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Download the latest form for attendance clearance requests.
              </p>
            </div>

            <a
              href="/forms/Absence-Clearance-Form 24-25.pdf"
              download
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-slate-800 transition"
            >
              <DownloadCloud className="w-4 h-4" />
              Download Form
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AttendancePage;
