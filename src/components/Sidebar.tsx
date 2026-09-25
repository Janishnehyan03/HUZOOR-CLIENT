import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  CalendarCheck,
  Download,
  X,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../contexts/userContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/students", label: "Students", icon: Users },
  { to: "/teachers", label: "Teachers", icon: GraduationCap },
  { to: "/manage-classes", label: "Classes", icon: Building2 },
  { to: "/subjects", label: "Subjects", icon: BookOpen },
  { to: "/manage-attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/monthly-report", label: "Monthly Report", icon: CalendarCheck },
  { to: "/downloads", label: "Downloads", icon: Download },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const appName = import.meta.env.VITE_APP_NAME || "Attendance Portal";

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const filteredNavItems = navItems.filter(
    (item) => user?.role === "admin" || item.label === "Dashboard" || item.label === "Teachers"
  ).map((item) => {
    if (user?.role !== "admin" && item.label === "Teachers") {
      return { ...item, label: "Teachers Status" };
    }
    return item;
  });

  const content = (
    <div className="h-full flex flex-col justify-between bg-white select-none">
      <div>
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-3.5 overflow-hidden group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex flex-col truncate">
              <span className="font-bold text-slate-900 text-base tracking-tight truncate group-hover:text-indigo-600 transition-colors">
                {appName}
              </span>
              <span className="text-[10px] uppercase font-semibold text-indigo-600 tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {user?.role === "admin" ? "Admin Portal" : "Faculty Portal"}
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-160px)]">
          <div className="px-3 pt-2 pb-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </p>
          </div>

          {filteredNavItems.map((item) => {
            const active = isActive(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-500/25"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    active ? "text-white" : "text-slate-400"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Box */}
      <div className="p-4 border-t border-slate-100">
        <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">System</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Online
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 border-r border-slate-200/80 bg-white z-40">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {content}
      </div>
    </>
  );
};

export default Sidebar;
