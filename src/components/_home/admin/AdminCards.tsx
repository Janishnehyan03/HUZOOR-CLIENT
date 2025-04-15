import {
  Book,
  Building,
  DownloadCloud,
  PenLineIcon,
  User,
  UserCog,
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardDetails from "./DashboardDetails";

function AdminCards() {
  const cards = [
    {
      title: "Teachers",
      description: "Manage faculty members and permissions",
      icon: <UserCog className="w-6 h-6 text-indigo-600" />,
      link: "/teachers",
      accent: "indigo",
    },
    {
      title: "Students",
      description: "View and manage student records",
      icon: <User className="w-6 h-6 text-emerald-600" />,
      link: "/students",
      accent: "emerald",
    },
    {
      title: "Subjects",
      description: "Curriculum and course management",
      icon: <Book className="w-6 h-6 text-amber-600" />,
      link: "/subjects",
      accent: "amber",
    },
    {
      title: "Classes",
      description: "Classrooms and scheduling",
      icon: <Building className="w-6 h-6 text-blue-600" />,
      link: "/manage-classes",
      accent: "blue",
    },
    {
      title: "Attendance",
      description: "Track and analyze attendance",
      icon: <PenLineIcon className="w-6 h-6 text-purple-600" />,
      link: "/manage-attendance",
      accent: "purple",
    },
    {
      title: "Downloads",
      description: "Reports and data exports",
      icon: <DownloadCloud className="w-6 h-6 text-rose-600" />,
      link: "/downloads",
      accent: "rose",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <DashboardDetails />
      <section className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Management Console
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Centralized control panel for all administrative functions
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <Link 
              to={card.link} 
              key={index} 
              className="group relative focus:outline-none"
            >
              <div className={`h-full bg-white rounded-xl p-6 transition-all duration-300 
                border border-gray-100 group-hover:border-${card.accent}-200
                shadow-sm group-hover:shadow-md overflow-hidden`}>
                
                {/* Animated accent bar */}
                <div className={`absolute top-0 left-0 w-1 h-full bg-${card.accent}-500 
                  transition-all duration-500 group-hover:h-full group-hover:w-1.5 
                  group-hover:bg-${card.accent}-600 opacity-20`} />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className={`mb-4 p-3 rounded-lg bg-${card.accent}-50 w-fit 
                    transition-all duration-300 group-hover:bg-${card.accent}-100`}>
                    {card.icon}
                  </div>
                  
                  <h3 className={`text-xl font-semibold text-gray-800 mb-2 
                    group-hover:text-${card.accent}-700 transition-colors`}>
                    {card.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {card.description}
                  </p>
                  
                  {/* Subtle "view" indicator */}
                  <div className="mt-auto flex items-center justify-end">
                    <span className={`text-xs font-medium text-${card.accent}-600 
                      opacity-0 group-hover:opacity-100 transition-opacity`}>
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminCards;