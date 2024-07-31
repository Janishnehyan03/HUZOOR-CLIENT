import { Book, Building, PenLineIcon, User, UserCog } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardDetails from "./DashboardDetails";

function AdminCards() {
  return (
    <>
      <DashboardDetails />
      <section className="px-8 mt-16 text-lg flex gap-6 justify-center flex-wrap">
        <div className="h-80 w-80 bg-primary rounded-2xl text-white text-center flex items-center flex-col justify-center gap-4 shadow-lg">
          <p className="text-2xl font-semibold">Teachers</p>
          <UserCog className="w-24 h-24" />
          <Link to="/teachers">
            <button className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-300">
              Manage Teachers
            </button>
          </Link>
        </div>
        <Link to="/students">
          <div className="h-80 w-80 bg-primary rounded-2xl text-white text-center flex items-center flex-col justify-center gap-4 shadow-lg">
            <p className="text-2xl font-semibold">Students</p>
            <User className="w-24 h-24" />
            <button className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-300">
              Manage Students
            </button>
          </div>
        </Link>
        <Link to="/subjects">
          <div className="h-80 w-80 bg-primary rounded-2xl text-white text-center flex items-center flex-col justify-center gap-4 shadow-lg">
            <p className="text-2xl font-semibold">Subjects</p>
            <Book className="w-24 h-24" />
            <button className="bg-white text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-300">
              Manage Subjects
            </button>
          </div>
        </Link>
        <Link to={"/manage-classes"}>
          <div className="h-80 w-80 bg-primary rounded-2xl text-white text-center flex items-center flex-col justify-center gap-4 shadow-lg">
            <p className="text-2xl font-semibold">Classes</p>
            <Building className="w-24 h-24" />
            <button className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-300">
              Manage Classes
            </button>
          </div>
        </Link>
        <Link to={"/manage-attendance"}>
          <div className="h-80 w-80 bg-primary rounded-2xl text-white text-center flex items-center flex-col justify-center gap-4 shadow-lg">
            <p className="text-2xl font-semibold">Attendance</p>
            <PenLineIcon className="w-24 h-24" />
            <button className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-300">
              Manage Attendance
            </button>
          </div>
        </Link>
      </section>
    </>
  );
}

export default AdminCards;
