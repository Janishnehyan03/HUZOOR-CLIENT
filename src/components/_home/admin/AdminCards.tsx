import {
  ArrowRight,
  BookOpen,
  Building2,
  DownloadCloud,
  PenTool,
  Users,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardDetails from "./DashboardDetails";

function AdminCards() {
  const cards = [
    {
      title: "Teachers",
      icon: <UserCheck className="w-8 h-8 text-indigo-600" />,
      link: "/teachers",
      iconBg: "bg-indigo-50 border border-indigo-100 text-indigo-600",
      accent: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Students",
      icon: <Users className="w-8 h-8 text-emerald-600" />,
      link: "/students",
      iconBg: "bg-emerald-50 border border-emerald-100 text-emerald-600",
      accent: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Subjects",
      icon: <BookOpen className="w-8 h-8 text-amber-600" />,
      link: "/subjects",
      iconBg: "bg-amber-50 border border-amber-100 text-amber-600",
      accent: "from-amber-500 to-amber-600",
    },
    {
      title: "Classes",
      icon: <Building2 className="w-8 h-8 text-blue-600" />,
      link: "/manage-classes",
      iconBg: "bg-blue-50 border border-blue-100 text-blue-600",
      accent: "from-blue-500 to-blue-600",
    },
    {
      title: "Attendance",
      icon: <PenTool className="w-8 h-8 text-purple-600" />,
      link: "/manage-attendance",
      iconBg: "bg-purple-50 border border-purple-100 text-purple-600",
      accent: "from-purple-500 to-purple-600",
    },
    {
      title: "Downloads",
      icon: <DownloadCloud className="w-8 h-8 text-rose-600" />,
      link: "/downloads",
      iconBg: "bg-rose-50 border border-rose-100 text-rose-600",
      accent: "from-rose-500 to-rose-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <DashboardDetails />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Quick Actions
          </h2>
        </div>

        {/* Action Modules Grid - Large Icon on Top + Title Below */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <Link to={card.link} key={index} className="group block">
              <article className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:border-indigo-300 flex flex-col justify-between h-full min-h-[160px]">
                {/* Top Accent Bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${card.accent} opacity-80 group-hover:opacity-100 transition-opacity`}
                />

                <div className="flex items-start justify-between">
                  {/* Large Icon Container on Top */}
                  <div className={`h-16 w-16 rounded-2xl ${card.iconBg} flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-300`}>
                    {card.icon}
                  </div>

                  <div className="h-9 w-9 rounded-full bg-slate-100 group-hover:bg-indigo-600 flex items-center justify-center text-slate-400 group-hover:text-white transition-all duration-200">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {card.title}
                  </h3>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminCards;