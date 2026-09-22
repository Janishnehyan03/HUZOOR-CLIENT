import { BookOpen, Users, GraduationCap, Clock, Sparkles } from "lucide-react";
import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useDashboardData } from "../../../contexts/dashboardContext";
import { useAuth } from "../../../contexts/userContext";

const DashboardDetails: React.FC = () => {
  const details = useDashboardData();
  const { user } = useAuth();
  const hasUrduStudents = import.meta.env.VITE_URDU_STUDENTS === "true";

  const [timeStr, setTimeStr] = useState(
    dayjs().format("dddd, MMMM D, YYYY • h:mm:ss A")
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(dayjs().format("dddd, MMMM D, YYYY • h:mm:ss A"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const Card: React.FC<{
    title: string;
    value: any;
    icon: React.ReactNode;
    iconBg: string;
    badgeText?: string;
  }> = ({ title, value, icon, iconBg, badgeText }) => (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-300">
      <div className="flex items-start justify-between">
        <div
          className={`h-12 w-12 rounded-2xl ${iconBg} flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform duration-300`}
        >
          {icon}
        </div>
        {badgeText && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
            {badgeText}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {value !== undefined && value !== null ? value : "—"}
        </p>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1.5">
          {title}
        </p>
      </div>
    </div>
  );

  return (
    <section className="space-y-6">
      {/* Top Welcome & Time Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Administrative Overview
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, <span className="text-indigo-600">{user?.name || "Admin"}</span> 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time enrollment figures and institutional summary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-semibold shadow-2xs">
            <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-mono">{timeStr}</span>
          </div>
        </div>
      </div>

      {/* Real Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card
          title="Total Students"
          value={details?.totalStudents}
          icon={<GraduationCap className="h-6 w-6 text-blue-600" />}
          iconBg="bg-blue-50 border border-blue-100"
          badgeText="Active"
        />
        <Card
          title="Total Teachers"
          value={details?.totalTeachers}
          icon={<Users className="h-6 w-6 text-indigo-600" />}
          iconBg="bg-indigo-50 border border-indigo-100"
          badgeText="Faculty"
        />
        <Card
          title={hasUrduStudents ? "Malayalam Students" : "Active Students"}
          value={details?.malayalamStudents}
          icon={<Users className="h-6 w-6 text-emerald-600" />}
          iconBg="bg-emerald-50 border border-emerald-100"
        />
        {hasUrduStudents && (
          <Card
            title="Urdu Students"
            value={details?.urduStudents}
            icon={<Users className="h-6 w-6 text-amber-600" />}
            iconBg="bg-amber-50 border border-amber-100"
          />
        )}
        <Card
          title="Total Subjects"
          value={details?.totalSubjects}
          icon={<BookOpen className="h-6 w-6 text-rose-600" />}
          iconBg="bg-rose-50 border border-rose-100"
          badgeText="Courses"
        />
      </div>
    </section>
  );
};

export default DashboardDetails;

