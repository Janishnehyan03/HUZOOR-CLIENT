import { BookOpen, Users } from "lucide-react";
import React from "react";
import { useDashboardData } from "../../../contexts/dashboardContext";

const DashboardDetails: React.FC = () => {
  const details = useDashboardData();

  const Card: React.FC<{
    title: string;
    value: any;
    icon: React.ReactNode;
  }> = ({ title, value, icon }) => (
    <div className="bg-white shadow-lg rounded-lg p-6 flex items-center">
      <div className="flex-shrink-0">{icon}</div>
      <div className="ml-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-2xl">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          title="Total Students"
          value={details?.totalStudents}
          icon={<Users className="h-12 w-12 text-primary" />}
        />

        <Card
          title="Total Teachers"
          value={details?.totalTeachers ? details?.totalTeachers - 1 : ""}
          icon={<Users className="h-12 w-12 text-purple-500" />}
        />

        <Card
          title="Total Subjects"
          value={details?.totalSubjects}
          icon={<BookOpen className="h-12 w-12 text-red-500" />}
        />
      </div>
    </div>
  );
};

export default DashboardDetails;
