import dayjs from "dayjs";
import { CalendarDays, Clock3, Edit2Icon, Users } from "lucide-react";
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
      const minutes = time[1];
      const period = hours < 12 ? "AM" : "PM";
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
    <section className="mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-6 sm:p-8 shadow-md mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <p className="text-indigo-100 text-sm font-medium mb-2">TEACHER DASHBOARD</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Welcome Back</h1>
              <p className="text-indigo-100 mt-2 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                {currentDay}, {currentDate}
              </p>
            </div>

          </div>
        </div>

        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {subjects.map((subject: any) => {
              const todaySchedule = subject.dateAndTime?.find(
                (time: any) => time.day.toLowerCase() === currentDay.toLowerCase()
              );

              return (
                <div
                  key={subject._id}
                  className={`rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    todaySchedule ? "ring-2 ring-indigo-200 border-indigo-200" : ""
                  }`}
                >
                  {todaySchedule && (
                    <div className="bg-indigo-600 px-4 py-2">
                      <p className="text-xs font-semibold text-white uppercase tracking-wide">
                        Scheduled Today
                      </p>
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4 gap-3">
                      <h3 className="text-lg font-semibold text-slate-900 leading-6">
                        {subject.name}{" "}
                        <span className="text-slate-500 text-sm font-medium">
                          {subject.class?.name && `(${subject.class.name})`}
                        </span>
                      </h3>

                      <button
                        className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-700 hover:border-indigo-200 flex items-center justify-center"
                        onClick={() => navigate(`/edit-period/${subject._id}`)}
                        aria-label="Edit subject"
                      >
                        <Edit2Icon size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-700 mb-5">
                      <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-slate-600" />
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        {subject?.students?.length || 0}
                      </span>
                      <span>{subject?.students?.length === 1 ? "Student" : "Students"}</span>
                    </div>

                    <div className="space-y-2.5 mb-5">
                      {subject.dateAndTime?.map((time: any, index: number) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            time.day.toLowerCase() === currentDay.toLowerCase()
                              ? "border-indigo-200 bg-indigo-50"
                              : "border-slate-100 bg-slate-50"
                          }`}
                        >
                          <p
                            className={`font-medium text-sm ${
                              time.day.toLowerCase() === currentDay.toLowerCase()
                                ? "text-indigo-700"
                                : "text-slate-700"
                            }`}
                          >
                            {time.day}
                          </p>
                          <p
                            className={`text-sm flex items-center gap-1.5 mt-0.5 ${
                              time.day.toLowerCase() === currentDay.toLowerCase()
                                ? "text-indigo-600"
                                : "text-slate-500"
                            }`}
                          >
                            <Clock3 className="w-3.5 h-3.5" />
                            {tConvert(time.startTime)} - {tConvert(time.endTime)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <Link
                      to={`/attendance/${subject._id}`}
                      className="block w-full bg-slate-900 hover:bg-slate-800 text-white text-center font-medium py-2.5 px-4 rounded-xl transition-colors duration-200"
                    >
                      Mark Attendance
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-2xl mx-auto text-center shadow-sm">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 mb-4">
              <Users className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Subjects Assigned</h3>
            <p className="text-slate-500">
              You currently don’t have any subjects assigned. Please contact your administrator.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default TeacherCards;
