import { Download, FileDown } from "lucide-react";

const Downloads = () => {
  const files = [
    {
      title: "Student Data",
      description: "Download student dataset in Excel format.",
      fileUrl: "/forms/students.xlsx",
      accent: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Teacher Data",
      description: "Download teacher dataset in Excel format.",
      fileUrl: "/forms/teachers.xlsx",
      accent: "bg-indigo-100 text-indigo-700",
    },
    {
      title: "Subject Data",
      description: "Download subject dataset in Excel format.",
      fileUrl: "/forms/subjects.xlsx",
      accent: "bg-amber-100 text-amber-700",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-rose-900 to-slate-900 p-6 sm:p-8 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-slate-300 text-xs sm:text-sm font-medium mb-2 tracking-wide">
                REPORTS
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                Downloads Center
              </h1>
              <p className="text-slate-200 mt-2 text-sm sm:text-base">
                Access clean export files for student, teacher, and subject data.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/20 px-5 py-4 min-w-[220px] shadow-inner">
              <p className="text-xs uppercase tracking-wide text-slate-300">
                Available Files
              </p>
              <p className="mt-1 text-white text-3xl font-bold">{files.length}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file, index) => (
            <article
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${file.accent}`}
                >
                  <FileDown className="w-5 h-5" />
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </div>

              <h2 className="text-lg font-semibold text-slate-900 mb-1">
                {file.title}
              </h2>
              <p className="text-sm text-slate-600 mb-5 leading-6">
                {file.description}
              </p>

              <a
                href={file.fileUrl}
                download
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-sm font-medium transition"
              >
                Download File
              </a>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Downloads;
