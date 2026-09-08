import { BookOpen, Users, GraduationCap, Clock } from "lucide-react";
import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useDashboardData } from "../../../contexts/dashboardContext";
import { useAuth } from "../../../contexts/userContext";

const DashboardDetails: React.FC = () => {
  const details = useDashboardData();
  const { user } = useAuth();
  const hasUrduStudents = import.meta.env.VITE_URDU_STUDENTS === "true";

  const [timeStr, setTimeStr] = useState(dayjs().format("dddd, MMMM D, YYYY • h:mm A"));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(dayjs().format("dddd, MMMM D, YYYY • h:mm A"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const Card: React.FC<{
    title: string;
    value: any;
    icon: React.ReactNode;
    iconBg: string;
  }> = ({ title, value, icon, iconBg }) => (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-300">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className={`h-12 w-12 rounded-2xl ${iconBg} flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {value !== undefined && value !== null ? value : "—"}
          </p>
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">
          {title}
        </p>
      </div>
    </div>
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
      {/* Top Welcome & Time Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, <span className="text-indigo-600">{user?.name || "Admin"}</span> 👋
          </h1>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-xs font-semibold shadow-2xs">
          <Clock className="w-4 h-4 text-indigo-600" />
          <span>{timeStr}</span>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="Total Students"
          value={details?.totalStudents}
          icon={<GraduationCap className="h-6 w-6 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <Card
          title="Total Teachers"
          value={details?.totalTeachers}
          icon={<Users className="h-6 w-6 text-indigo-600" />}
          iconBg="bg-indigo-50"
        />
        <Card
          title={hasUrduStudents ? "Malayalam Students" : "Active Students"}
          value={details?.malayalamStudents}
          icon={<Users className="h-6 w-6 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        {hasUrduStudents && (
          <Card
            title="Urdu Students"
            value={details?.urduStudents}
            icon={<Users className="h-6 w-6 text-amber-600" />}
            iconBg="bg-amber-50"
          />
        )}
        <Card
          title="Total Subjects"
          value={details?.totalSubjects}
          icon={<BookOpen className="h-6 w-6 text-rose-600" />}
          iconBg="bg-rose-50"
        />
      </div>
    </section>
  );
};

export default DashboardDetails;
