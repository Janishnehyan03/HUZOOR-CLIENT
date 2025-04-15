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
    <section className=" mx-auto px-4 sm:px-6 py-8 bg-gray-50 min-h-screen">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Subjects</h2>
        <div className="text-lg text-gray-600">
          <span className="font-medium text-blue-600">{currentDay}</span>, {currentDate}
        </div>
      </div>

      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject: any) => {
            const todaySchedule = subject.dateAndTime?.find(
              (time: any) => time.day.toLowerCase() === currentDay.toLowerCase()
            );
            
            return (
              <div
                key={subject._id}
                className={`bg-white rounded-xl shadow-lg p-6 text-center relative transition-all hover:shadow-xl hover:-translate-y-1 border-t-4 ${
                  todaySchedule ? "border-blue-500" : "border-transparent"
                }`}
              >
                {todaySchedule && (
                  <span className="absolute top-0 left-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-br rounded-tl">
                    Today's Class
                  </span>
                )}
                <button
                  className="absolute top-4 right-4 bg-blue-100 p-2 rounded-full hover:bg-blue-200 transition"
                  onClick={() => navigate(`/edit-period/${subject._id}`)}
                >
                  <Edit2Icon size={18} className="text-blue-600" />
                </button>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {subject.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {subject?.students?.length || 0} Students
                </p>
                <div className="text-sm text-gray-700 mb-4 space-y-2">
                  {subject.dateAndTime?.map((time: any, index: number) => (
                    <div 
                      key={index} 
                      className={`p-2 rounded ${
                        time.day.toLowerCase() === currentDay.toLowerCase() 
                          ? "bg-blue-50 text-blue-700 font-medium" 
                          : ""
                      }`}
                    >
                      <p className="font-medium text-blue-600">{time.day}</p>
                      <p>
                        {tConvert(time.startTime)} - {tConvert(time.endTime)}
                      </p>
                    </div>
                  ))}
                </div>
                <Link to={`/attendance/${subject._id}`}>
                  <button className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                    Mark Attendance
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-xl text-gray-600 mb-4">No Subjects Assigned</div>
          <p className="text-gray-500 max-w-md mx-auto">
            You currently don't have any subjects assigned to you. Please contact your administrator.
          </p>
        </div>
      )}
    </section>
  );
}

export default TeacherCards;