import { Book, Menu, User } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const AttendancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h1 className="text-3xl text-center font-bold  my-5 text-gray-600">
        Check Your Attendance Status{" "}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl w-full">
        <Link to={"/manage-attendance/students"}>
          <div className="bg-white shadow-lg rounded-lg p-6 text-center hover:bg-gray-100 transition duration-300 ease-in-out">
            <div className="flex justify-center items-center mb-4">
              <User className="text-gray-800 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Student</h2>
            <p className="text-gray-600 mb-4">Check students' attendance</p>
            <button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-300 ease-in-out">
              Go To Details
            </button>
          </div>
        </Link>
        <Link to={"/manage-attendance/subjects"}>
          <div className="bg-white shadow-lg rounded-lg p-6 text-center hover:bg-gray-100 transition duration-300 ease-in-out">
            <div className="flex justify-center items-center mb-4">
              <Book className="text-gray-800 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Subject</h2>
            <p className="text-gray-600 mb-4">
              Check your attendance by subjects
            </p>
            <button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-300 ease-in-out">
              Go To Details
            </button>
          </div>
        </Link>
        <Link to={"/manage-attendance/departments"}>
          <div className="bg-white shadow-lg rounded-lg p-6 text-center hover:bg-gray-100 transition duration-300 ease-in-out">
            <div className="flex justify-center items-center mb-4">
              <Menu className="text-gray-800 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Department
            </h2>
            <p className="text-gray-600 mb-4">
              Check your attendance by departments
            </p>
            <button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition duration-300 ease-in-out">
              Go To Details
            </button>
          </div>
        </Link>
      </div>

      <div className="mt-8 max-w-3xl w-full">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          Download Resources
        </h2>
        <div className=" p-4 text-center">
          <a
            href="/forms/Absence-Clearance-Form 24-25.pdf"
            download
            className="text-primary block mb-2"
          >
            Download Attendance Clearance PDF
          </a>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
