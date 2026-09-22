import {
  ArrowRight,
  BookOpen,
  Building2,
  DownloadCloud,
  PenTool,
  Users,
  GraduationCap,
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardDetails from "./DashboardDetails";

function AdminCards() {
  const cards = [
    {
      title: "Students",
      description: "Manage student records, roll numbers & enrollments",
      icon: <Users className="w-7 h-7 text-blue-600" />,
      link: "/students",
      iconBg: "bg-blue-50 border border-blue-100/80 text-blue-600",
      accent: "from-blue-600 to-indigo-600",
    },
    {
      title: "Teachers",
      description: "Faculty profiles, logins & subject assignments",
      icon: <GraduationCap className="w-7 h-7 text-indigo-600" />,
      link: "/teachers",
      iconBg: "bg-indigo-50 border border-indigo-100/80 text-indigo-600",
      accent: "from-indigo-600 to-violet-600",
    },
    {
      title: "Classes",
      description: "Create and manage academic classes and divisions",
      icon: <Building2 className="w-7 h-7 text-emerald-600" />,
      link: "/manage-classes",
      iconBg: "bg-emerald-50 border border-emerald-100/80 text-emerald-600",
      accent: "from-emerald-600 to-teal-600",
    },
    {
      title: "Subjects",
      description: "Course schedules, timings & assigned faculties",
      icon: <BookOpen className="w-7 h-7 text-amber-600" />,
      link: "/subjects",
      iconBg: "bg-amber-50 border border-amber-100/80 text-amber-600",
      accent: "from-amber-500 to-orange-600",
    },
    {
      title: "Attendance",
      description: "Daily marking, clearance & minus records",
      icon: <PenTool className="w-7 h-7 text-purple-600" />,
      link: "/manage-attendance",
      iconBg: "bg-purple-50 border border-purple-100/80 text-purple-600",
      accent: "from-purple-600 to-pink-600",
    },
    {
      title: "Downloads",
      description: "Export student lists, sheets & PDF reports",
      icon: <DownloadCloud className="w-7 h-7 text-rose-600" />,
      link: "/downloads",
      iconBg: "bg-rose-50 border border-rose-100/80 text-rose-600",
      accent: "from-rose-500 to-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-10">
        {/* Real Metrics & Header Banner */}
        <DashboardDetails />

        {/* Quick Action Modules */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Quick Actions
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Direct access to core administrative management tools.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <Link to={card.link} key={index} className="group block">
                <article className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:border-indigo-300 flex flex-col justify-between h-full min-h-[190px]">
                  {/* Subtle top accent gradient */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${card.accent} opacity-80 group-hover:opacity-100 transition-opacity`}
                  />

                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`h-14 w-14 rounded-2xl ${card.iconBg} flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform duration-300`}
                    >
                      {card.icon}
                    </div>

                    <div className="h-9 w-9 rounded-2xl bg-slate-100/80 group-hover:bg-indigo-600 flex items-center justify-center text-slate-400 group-hover:text-white transition-all duration-200 shrink-0">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminCards;