import dayjs from "dayjs"; // Import the dayjs library for date manipulation
import { Edit2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Axios from "../../../Axios";
import { useAuth } from "../../../contexts/userContext";

function TeacherCards() {
  const currentDay = dayjs().format("dddd"); // Get the current day of the week
  const [currentSubject, setCurrentSubject] = useState<any>();
  const [subjectsNotToday, setSubjectsNotToday] = useState<any[]>([]);
  const [subjectsToday, setSubjectsToday] = useState<any[]>([]);
  const { user } = useAuth();

  const navigate = useNavigate();

  const getMyPeriods = async () => {
    try {
      const { data } = await Axios.get("/subject/get/periods");
      setSubjectsNotToday(data.subjectsNotToday);
      setCurrentSubject(data.currentPeriod);

      // Filter out the current period from subjectsToday
      const filteredSubjectsToday = data.subjectsToday.filter(
        (subject: { _id: any }) =>
          subject._id !== data.currentPeriod?.subject?._id
      );
      setSubjectsToday(filteredSubjectsToday);
    } catch (error: any) {
      console.log(error.response);
    } 
  };

  function tConvert(time: any) {
    // Check correct time format and split into components
    time = time?.toString().match(/^([01]\d|2[0-3]):([0-5]\d)$/) || [time];

    if (time.length > 1) {
      // If time format is correct
      time = time.slice(1); // Remove full string match value
      let hours = +time[0];
      let minutes = time[1];
      let period = hours < 12 ? "AM" : "PM"; // Set AM/PM
      hours = hours % 12 || 12; // Adjust hours
      return `${hours}:${minutes} ${period}`; // Return formatted time
    }
    return time[0]; // Return original string if format is incorrect
  }

  useEffect(() => {
    if (user?.role === "teacher") {
      getMyPeriods();
    }
  }, []);


  return (
    <section className="px-4 mt-16 text-lg md:px-20">
      {currentSubject && (
        <>
          <div
            key={currentSubject._id}
            className="relative bg-sky-900 h-52 max-w-md mx-auto my-3 bg-cover rounded-2xl text-sky-100 text-center flex flex-col items-center justify-center gap-2"
          >
            <button
              className="absolute top-2 right-2 bg-sky-600 p-2 rounded-full text-white hover:bg-sky-500 transition duration-300 ease-in-out"
              onClick={() =>
                navigate(`/edit-period/${currentSubject?.subject?._id}`)
              }
            >
              <Edit2Icon size={24} />
            </button>
            <p className="text-2xl font-bold">
              {currentSubject?.subject?.name}
            </p>
            <p className="text-sm font-semibold">
              {currentSubject?.students?.length}
            </p>
            <p className="text-sm font-bold">
              {tConvert(currentSubject?.startTime)} -{" "}
              {tConvert(currentSubject?.endTime)}
            </p>

            <Link to={`/attendance/${currentSubject?.subject?._id}`}>
              <button className="bg-sky-500 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-700 transition duration-300 ease-in-out">
                Mark Attendance
              </button>
            </Link>
          </div>
        </>
      )}
      {subjectsToday.length > 0 ? (
        <>
          <h1 className="text-center font-bold">Periods today</h1>
          <div className="grid grid-cols-1 my-3 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {subjectsToday.map((subject: any) => (
              <div
                key={subject._id}
                className="relative bg-sky-600 h-64 bg-cover rounded-2xl text-white text-center flex flex-col items-center justify-center gap-2"
              >
                <button
                  className="absolute top-2 right-2 bg-sky-500 p-2 rounded-full text-white hover:bg-sky-700 transition duration-300 ease-in-out"
                  onClick={() => navigate(`/edit-period/${subject._id}`)}
                >
                  <Edit2Icon size={24} />
                </button>
                <p className="text-2xl font-bold ">{subject.name}</p>
                <p className="text-sm text-gray-300 font-semibold">
                  {subject?.students?.length} students
                </p>
                <div>
                  {subject.dateAndTime
                    .filter(
                      (time: any) =>
                        time.day.toLowerCase() === currentDay.toLowerCase()
                    )
                    .map((time: any) => (
                      <p key={time._id}>
                        {tConvert(time.startTime)} - {tConvert(time.endTime)}
                      </p>
                    ))}
                </div>
                <Link to={`/attendance/${subject._id}`}>
                  <button className="bg-sky-50 px-4 py-2  text-sky-900 rounded-lg text-sm font-semibold hover:bg-sky-200 transition duration-300 ease-in-out">
                    Mark Attendance
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </>
      ) : (
        <h1 className="text-center text-xl text-sky-600 lowercase">
          No Remaining Periods Today
        </h1>
      )}
      {subjectsNotToday.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 justify-center">
          {subjectsNotToday.map((subject: any) => (
            <div
              key={subject._id}
              className="relative bg-sky-400 h-52 bg-cover rounded-2xl text-sky-500 text-center flex flex-col items-center justify-center gap-2"
            >
              <button
                className="absolute top-2 right-2 bg-sky-500 p-1 rounded-full text-white hover:bg-sky-700 transition duration-300 ease-in-out"
                onClick={() => navigate(`/edit-period/${subject._id}`)}
              >
                <Edit2Icon size={18} />
              </button>
              <p className="text-2xl font-bold text-sky-800">{subject.name}</p>
              <p className="text-sm text-white font-semibold">
                {subject?.students?.length} students
              </p>
              <Link to={`/attendance/${subject._id}`}>
                <button className="bg-sky-50 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-400 hover:text-white transition duration-300 ease-in-out">
                  Mark Attendance
                </button>
              </Link>
              <div className="text-sm flex text-white">
                {subject.dateAndTime.map((period: any, index: number) => (
                  <p
                    key={index}
                    className="bg-sky-300 p-1 px-2 m-1 rounded-full"
                  >
                    {period.day}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default TeacherCards;
