import dayjs from "dayjs";
import { Edit2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Axios from "../../../Axios";
import { useAuth } from "../../../contexts/userContext";

function TeacherCards() {
  const currentDay = dayjs().format("dddd");
  const currentDate = dayjs().format("MMMM D, YYYY");
  const [subjects, setSubjects] = useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const getMyPeriods = async () => {
    try {
      const { data } = await Axios.get("/subject/get/periods");
      setSubjects(data.subjects || []);
    } catch (error: any) {
      console.log(error.response);
    }
  };

  function tConvert(time: any) {
    time = time?.toString().match(/^([01]\d|2[0-3]):([0-5]\d)$/) || [time];
    if (time.length > 1) {
      time = time.slice(1);
      let hours = +time[0];
      let minutes = time[1];
      let period = hours < 12 ? "AM" : "PM";
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${period}`;
    }
    return time[0];
  }

  useEffect(() => {
    if (user?.role === "teacher") {
      getMyPeriods();
    }
  }, []);

  return (
    <section className="mx-auto px-4 sm:px-6 py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Teacher Dashboard</h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              <span className="font-medium text-indigo-600">{currentDay}</span>, {currentDate}
            </p>
            <p className="text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
              {subjects.length} {subjects.length === 1 ? 'Subject' : 'Subjects'}
            </p>
          </div>
        </div>

        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject: any) => {
              const todaySchedule = subject.dateAndTime?.find(
                (time: any) => time.day.toLowerCase() === currentDay.toLowerCase()
              );
              
              return (
                <div
                  key={subject._id}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:border-indigo-100 ${
                    todaySchedule ? "ring-2 ring-indigo-200" : ""
                  }`}
                >
                  {todaySchedule && (
                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2">
                      <p className="text-xs font-semibold text-white uppercase tracking-wider">
                        Today's Class
                      </p>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900 truncate">
                        {subject.name} <span className="text-gray-500 text-sm">
                           {subject.class?.name && `(${subject.class.name})`}
                        </span>
                      </h3>
                      <button
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                        onClick={() => navigate(`/edit-period/${subject._id}`)}
                        aria-label="Edit subject"
                      >
                        <Edit2Icon size={18} />
                      </button>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 mr-2">
                        {subject?.students?.length || 0}
                      </span>
                      <span>{subject?.students?.length === 1 ? 'Student' : 'Students'}</span>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {subject.dateAndTime?.map((time: any, index: number) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border ${
                            time.day.toLowerCase() === currentDay.toLowerCase() 
                              ? "border-indigo-200 bg-indigo-50" 
                              : "border-gray-100"
                          }`}
                        >
                          <p className={`font-medium ${
                            time.day.toLowerCase() === currentDay.toLowerCase() 
                              ? "text-indigo-700" 
                              : "text-gray-700"
                          }`}>
                            {time.day}
                          </p>
                          <p className={`text-sm ${
                            time.day.toLowerCase() === currentDay.toLowerCase() 
                              ? "text-indigo-600" 
                              : "text-gray-500"
                          }`}>
                            {tConvert(time.startTime)} - {tConvert(time.endTime)}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <Link 
                      to={`/attendance/${subject._id}`}
                      className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
                    >
                      Mark Attendance
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 max-w-2xl mx-auto text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects Assigned</h3>
            <p className="text-gray-500">
              You currently don't have any subjects assigned. Please contact your administrator to get started.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default TeacherCards;