import {
  ArrowRight,
  Book,
  Building,
  DownloadCloud,
  GraduationCap,
  PenLineIcon,
  User,
  UserCog,
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardDetails from "./DashboardDetails";

function AdminCards() {
  const cards = [
    {
      title: "Teachers",
      description: "Manage faculty members and permissions",
      icon: <UserCog className="w-5 h-5 text-indigo-700" />,
      link: "/teachers",
      iconWrap: "bg-indigo-100",
    },
    {
      title: "Students",
      description: "View and manage student records",
      icon: <User className="w-5 h-5 text-emerald-700" />,
      link: "/students",
      iconWrap: "bg-emerald-100",
    },
    {
      title: "Subjects",
      description: "Curriculum and course management",
      icon: <Book className="w-5 h-5 text-amber-700" />,
      link: "/subjects",
      iconWrap: "bg-amber-100",
    },
    {
      title: "Classes",
      description: "Classrooms and scheduling",
      icon: <Building className="w-5 h-5 text-blue-700" />,
      link: "/manage-classes",
      iconWrap: "bg-blue-100",
      featured: true,
      badge: "Core Ops",
    },
    {
      title: "Attendance",
      description: "Track and analyze attendance",
      icon: <PenLineIcon className="w-5 h-5 text-purple-700" />,
      link: "/manage-attendance",
      iconWrap: "bg-purple-100",
      featured: true,
      badge: "Daily Focus",
    },
    {
      title: "Downloads",
      description: "Reports and data exports",
      icon: <DownloadCloud className="w-5 h-5 text-rose-700" />,
      link: "/downloads",
      iconWrap: "bg-rose-100",
      featured: true,
      badge: "Reports",
    },
  ];

  return (
    <div className="min-h-screen">
      <DashboardDetails />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-indigo-600 mb-2">
                ADMIN WORKSPACE
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Quick Actions
              </h2>
              <p className="text-slate-600 mt-2">
                Manage classes, people, subjects, and attendance from one place.
              </p>
            </div>

            <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">System Role</p>
                  <p className="font-semibold text-slate-900">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card, index) => (
            <Link to={card.link} key={index} className="group">
              <article
                className={`h-full rounded-2xl border p-5 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md ${
                  card.featured
                    ? "bg-gradient-to-br from-white to-slate-50 border-slate-300 shadow"
                    : "bg-white border-slate-200 shadow-sm group-hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.iconWrap}`}
                  >
                    {card.icon}
                  </div>

                  <div className="flex items-center gap-2">
                    {card.featured && (
                      <span className="inline-flex items-center rounded-full bg-slate-900 text-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide">
                        {card.badge}
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 leading-6">
                    {card.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span
                    className={`text-sm font-medium ${
                      card.featured ? "text-slate-900" : "text-slate-800"
                    }`}
                  >
                    Open Module
                  </span>
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