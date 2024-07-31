import { BookOpen, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import Axios from "../../../Axios";
import Loading from "../../Loading";

interface Details {
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
}

const DashboardDetails: React.FC = () => {
  const [details, setDetails] = useState<Details | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const { data } = await Axios.get("/details");
        setDetails(data);
      } catch (error: any) {
        console.error(error.response);
      }
    };

    getData();
  }, []);

  if (!details) {
    return <Loading />;
  }

  const Card: React.FC<{
    title: string;
    value: number;
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
          value={details.totalStudents}
          icon={<Users className="h-12 w-12 text-primary" />}
        />
 
  
        <Card
          title="Total Teachers"
          value={details.totalTeachers-1}
          icon={<Users className="h-12 w-12 text-purple-500" />}
        />
        <Card
          title="Total Subjects"
          value={details.totalSubjects}
          icon={<BookOpen className="h-12 w-12 text-red-500" />}
        />
      </div>
    </div>
  );
};

export default DashboardDetails;
