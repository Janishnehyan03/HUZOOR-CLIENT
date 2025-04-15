import { Book, Menu, User } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const AttendancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center px-6 py-16">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Attendance Management
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Effortlessly track and manage attendance for students, subjects, and
          departments with our streamlined tools.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
        <Link to="/manage-attendance/students">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center transform transition-all hover:scale-105 hover:shadow-xl">
            <div className="flex justify-center items-center mb-6">
              <User className="text-blue-600 w-12 h-12" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Students
            </h2>
            <p className="text-gray-600 mb-6">
              Monitor individual student attendance records with ease.
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition duration-300">
              View Details
            </button>
          </div>
        </Link>
        <Link to="/manage-attendance/subjects">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center transform transition-all hover:scale-105 hover:shadow-xl">
            <div className="flex justify-center items-center mb-6">
              <Book className="text-blue-600 w-12 h-12" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Subjects
            </h2>
            <p className="text-gray-600 mb-6">
              Track attendance for specific subjects across classes.
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition duration-300">
              View Details
            </button>
          </div>
        </Link>
        <Link to="/manage-attendance/departments">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center transform transition-all hover:scale-105 hover:shadow-xl">
            <div className="flex justify-center items-center mb-6">
              <Menu className="text-blue-600 w-12 h-12" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Departments
            </h2>
            <p className="text-gray-600 mb-6">
              Analyze attendance trends by department for better insights.
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition duration-300">
              View Details
            </button>
          </div>
        </Link>
      </div>

      <div className="mt-16 max-w-4xl w-full text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Download Resources
        </h2>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600 mb-4">
            Access essential forms and documents to manage attendance
            effectively.
          </p>
          <a
            href="/forms/Absence-Clearance-Form 24-25.pdf"
            download
            className="inline-block bg-blue-100 text-blue-700 px-6 py-3 rounded-lg font-medium hover:bg-blue-200 transition duration-300"
          >
            Download Attendance Clearance Form
          </a>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
