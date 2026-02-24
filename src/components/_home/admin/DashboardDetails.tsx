import { BookOpen, Users } from "lucide-react";
import React from "react";
import { useDashboardData } from "../../../contexts/dashboardContext";

const DashboardDetails: React.FC = () => {
  const details = useDashboardData();
  const hasUrduStudents = import.meta.env.VITE_URDU_STUDENTS === "true";

  const Card: React.FC<{
    title: string;
    value: any;
    icon: React.ReactNode;
    bgClass: string;
  }> = ({ title, value, icon, bgClass }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </h2>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value ?? "N/A"}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bgClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-8 sm:px-8 sm:py-10 mb-6 shadow-md">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-200 mt-2 max-w-2xl">
          Monitor academic operations with real-time visibility across students,
          teachers, and attendance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="Total Students"
          value={details?.totalStudents}
          icon={<Users className="h-5 w-5 text-blue-700" />}
          bgClass="bg-blue-100"
        />
        <Card
          title="Total Teachers"
          value={details?.totalTeachers}
          icon={<Users className="h-5 w-5 text-purple-700" />}
          bgClass="bg-purple-100"
        />
        <Card
          title={hasUrduStudents ? "Malayalam Students" : "Students"}
          value={details?.malayalamStudents}
          icon={<Users className="h-5 w-5 text-emerald-700" />}
          bgClass="bg-emerald-100"
        />
        {hasUrduStudents && (
          <Card
            title="Urdu Students"
            value={details?.urduStudents}
            icon={<Users className="h-5 w-5 text-orange-700" />}
            bgClass="bg-orange-100"
          />
        )}
        <Card
          title="Total Subjects"
          value={details?.totalSubjects}
          icon={<BookOpen className="h-5 w-5 text-rose-700" />}
          bgClass="bg-rose-100"
        />
      </div>
    </section>
  );
};

export default DashboardDetails;
