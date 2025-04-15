import { BookOpen, Users } from "lucide-react";
import React from "react";
import { useDashboardData } from "../../../contexts/dashboardContext";

const DashboardDetails: React.FC = () => {
  const details = useDashboardData();

  const Card: React.FC<{
    title: string;
    value: any;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <div className="bg-white shadow-xl rounded-xl p-6 flex items-center transform transition-all hover:scale-105 hover:shadow-2xl">
      <div className={`flex-shrink-0 p-3 rounded-full ${color}`}>{icon}</div>
      <div className="ml-4">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          {title}
        </h2>
        <p className="text-2xl font-bold text-gray-900">{value || "N/A"}</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 ">
      <h1 className="text-4xl font-extrabold mb-10 text-center text-gray-800">
        Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-6">
        <Card
          title="Total Students"
          value={details?.totalStudents}
          icon={<Users className="h-8 w-8 text-blue-600" />}
          color="bg-blue-100"
        />
        <Card
          title="Total Teachers"
          value={details?.totalTeachers ? details?.totalTeachers - 1 : ""}
          icon={<Users className="h-8 w-8 text-purple-600" />}
          color="bg-purple-100"
        />
        <Card
          title="Malayalam Students"
          value={
            details?.malayalamStudents ? details?.malayalamStudents - 1 : ""
          }
          icon={<Users className="h-8 w-8 text-green-600" />}
          color="bg-green-100"
        />
        <Card
          title="Urdu Teachers"
          value={details?.urduStudents ? details?.urduStudents - 1 : ""}
          icon={<Users className="h-8 w-8 text-orange-600" />}
          color="bg-orange-100"
        />
        <Card
          title="Total Subjects"
          value={details?.totalSubjects}
          icon={<BookOpen className="h-8 w-8 text-red-600" />}
          color="bg-red-100"
        />
      </div>
    </div>
  );
};

export default DashboardDetails;
