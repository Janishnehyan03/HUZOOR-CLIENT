import { Download, FileDown, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";
import Axios from "../../Axios";
import toast from "react-hot-toast";

const Downloads = () => {
  const [exportingStudents, setExportingStudents] = useState(false);

  const handleExportLiveStudents = async () => {
    try {
      setExportingStudents(true);
      const { data } = await Axios.get("/student?limit=10000&sortBy=rollNumber:asc");
      const students = (data.students || []).sort(
        (a: any, b: any) => {
          const rollA = Number(a.rollNumber) || 0;
          const rollB = Number(b.rollNumber) || 0;
          if (rollA !== rollB) return rollA - rollB;
          return (a.name || "").localeCompare(b.name || "");
        }
      );

      const rows = students.map((s: any) => ({
        "Roll Number": s.rollNumber ?? "",
        "Student Name": s.name || "",
        "Admission Number": s.admissionNumber || "",
        "Class": s.class?.name || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Students by Roll No");
      XLSX.writeFile(workbook, "students_by_roll_number.xlsx");
      toast.success("Downloaded student dataset ordered by roll number");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export students dataset");
    } finally {
      setExportingStudents(false);
    }
  };

  const files = [
    {
      title: "Live Students by Roll Number",
      description: "Export full live student database ordered by roll number.",
      isLiveExport: true,
      accent: "bg-blue-100 text-blue-700",
    },
    {
      title: "Student Template",
      description: "Sample template for bulk student Excel upload.",
      fileUrl: "/forms/students.xlsx",
      accent: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Teacher Template",
      description: "Sample template for bulk teacher Excel upload.",
      fileUrl: "/forms/teachers.xlsx",
      accent: "bg-indigo-100 text-indigo-700",
    },
    {
      title: "Subject Template",
      description: "Sample template for bulk subject Excel upload.",
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
                REPORTS & EXPORTS
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                Downloads Center
              </h1>
              <p className="text-slate-200 mt-2 text-sm sm:text-base">
                Access clean export files and live datasets ordered by roll number.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/20 px-5 py-4 min-w-[220px] shadow-inner">
              <p className="text-xs uppercase tracking-wide text-slate-300">
                Available Reports
              </p>
              <p className="mt-1 text-white text-3xl font-bold">{files.length}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {files.map((file, index) => (
            <article
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${file.accent}`}
                  >
                    {file.isLiveExport ? (
                      <FileSpreadsheet className="w-5 h-5" />
                    ) : (
                      <FileDown className="w-5 h-5" />
                    )}
                  </div>
                  <Download className="w-4 h-4 text-slate-400" />
                </div>

                <h2 className="text-base font-bold text-slate-900 mb-1">
                  {file.title}
                </h2>
                <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                  {file.description}
                </p>
              </div>

              {file.isLiveExport ? (
                <button
                  onClick={handleExportLiveStudents}
                  disabled={exportingStudents}
                  className="w-full inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-sm font-medium transition cursor-pointer disabled:opacity-50"
                >
                  {exportingStudents ? "Exporting..." : "Export Live Report"}
                </button>
              ) : (
                <a
                  href={file.fileUrl}
                  download
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-sm font-medium transition"
                >
                  Download Template
                </a>
              )}
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Downloads;

