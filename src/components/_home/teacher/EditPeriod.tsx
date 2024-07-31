import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "../../../Axios";
import toast from "react-hot-toast";
import Loading from "../../Loading";

const EditPeriod = () => {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [newPeriodData, setNewPeriodData] = useState<any>({
    day: "",
    period: 1,
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const getSubject = async () => {
    setLoading(true);
    try {
      let { data } = await Axios.get(`/subject/${subjectId}`);
      setSubject(data.subject);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.log(error.response);
    }
  };

  const handlePeriodChange = (e: any, isEdit: boolean = true) => {
    const period = parseInt(e.target.value);
    const periodTimes = [
      { start: "07:45", end: "08:30" },
      { start: "08:30", end: "09:15" },
      { start: "09:40", end: "10:25" },
      { start: "10:25", end: "11:10" },
      { start: "11:20", end: "12:05" },
      { start: "12:05", end: "12:50" },
      { start: "14:00", end: "14:40" },
      { start: "14:35", end: "15:20" },
      { start: "15:30", end: "16:07" },
    ];

    const startTime = periodTimes[period - 1].start;
    const endTime = periodTimes[period - 1].end;

    if (isEdit) {
      setFormData({ ...formData, period, startTime, endTime });
    } else {
      setNewPeriodData({ ...newPeriodData, period, startTime, endTime });
    }
  };

  const handleEditClick = (index: number) => {
    setEditIndex(index);
    setFormData(subject.dateAndTime[index]);
  };

  const handleRemoveItem = async (e: any, itemId: string) => {
    if (window.confirm("Are you sure to remove the item")) {
      e.preventDefault();
      try {
        await Axios.delete(`/subject/${subjectId}/dateAndTime/${itemId}`);
        toast.success("Time Table Removed");
        getSubject();
      } catch (error) {
        console.error("Error removing item:", error);
        toast.error("Something went wrong");
      }
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (editIndex === null) return;

    try {
      let updatedDateAndTime = [...subject.dateAndTime];
      updatedDateAndTime[editIndex] = formData;

      let response = await Axios.patch(`/subject/${subjectId}`, {
        dateAndTime: updatedDateAndTime,
      });
      if (response.status === 200) {
        toast.success("Subject edited");
        setSubject((prev: any) => ({
          ...prev,
          dateAndTime: updatedDateAndTime,
        }));
        setEditIndex(null);
      }
    } catch (error: any) {
      toast.error("Something went wrong");
      console.log(error.response);
    }
  };

  const handleAddNewPeriod = async (e: any) => {
    e.preventDefault();

    if (subject.dateAndTime.length >= 6) {
      toast.error("Cannot add more than 6 days");
      return;
    }

    try {
      let updatedDateAndTime = [...subject.dateAndTime, newPeriodData];

      let response = await Axios.patch(`/subject/${subjectId}`, {
        dateAndTime: updatedDateAndTime,
      });
      if (response.status === 200) {
        toast.success("New period added");
        setSubject((prev: any) => ({
          ...prev,
          dateAndTime: updatedDateAndTime,
        }));
        setNewPeriodData({ day: "", period: 1 });
      }
    } catch (error: any) {
      toast.error("Something went wrong");
      console.log(error.response);
    }
  };

  function tConvert(time: any) {
    if (time) {
      time = time
        ?.toString()
        .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

      if (time.length > 1) {
        // If time format correct
        time = time.slice(1); // Remove full string match value
        time[5] = +time[0] < 12 ? "AM" : "PM"; // Set AM/PM
        time[0] = +time[0] % 12 || 12; // Adjust hours
      }
      return time.join(""); // return adjusted time or original string
    }
  }

  useEffect(() => {
    getSubject();
  }, [subjectId]);

  if (loading) {
    return <Loading />;
  }
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Saturday",
    "Sunday",
  ];

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md max-w-md mx-auto">
      <h1 className="text-xl font-semibold text-green-600 text-center my-4">
        {subject?.name}
      </h1>
      <ul>
        {subject?.dateAndTime.map((dt: any, index: number) => (
          <li key={index} className="mb-4">
            <div className="flex justify-between items-center">
              <span>{`${dt.day}, Period ${dt.period}: ${tConvert(
                dt.startTime
              )} - ${tConvert(dt.endTime)}`}</span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleEditClick(index)}
                  className="text-primary underline"
                >
                  Edit
                </button>{" "}
                <button
                  onClick={(e) => handleRemoveItem(e, dt._id)}
                  className="text-red-500 underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {editIndex !== null && (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="day"
              className="block text-sm font-medium text-gray-700"
            >
              Day:
            </label>
            <select
              id="day"
              name="day"
              value={formData?.day}
              onChange={(e) =>
                setFormData({ ...formData, day: e.target.value })
              }
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            >
              <option hidden>select a day </option>
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="period"
              className="block text-sm font-medium text-gray-700"
            >
              Period:
            </label>
            <select
              id="period"
              name="period"
              value={formData?.period}
              onChange={(e) => handlePeriodChange(e, true)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            >
              <option hidden>select a period </option>
              {Array.from({ length: 9 }).map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  Period {index + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="startTime"
              className="block text-sm font-medium text-gray-700"
            >
              Start Time:
            </label>
            <input
              type="text"
              id="startTime"
              name="startTime"
              value={tConvert(formData?.startTime)}
              readOnly
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="endTime"
              className="block text-sm font-medium text-gray-700"
            >
              End Time:
            </label>
            <input
              type="text"
              id="endTime"
              name="endTime"
              value={tConvert(formData?.endTime)}
              readOnly
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Save
          </button>
        </form>
      )}

      {subject && subject.dateAndTime.length < 6 && (
        <form onSubmit={handleAddNewPeriod} className="mt-8">
          <h2 className="text-lg font-semibold text-center">Add New Period</h2>
          <div className="mb-4">
            <label
              htmlFor="newDay"
              className="block text-sm font-medium text-gray-700"
            >
              Day:
            </label>
            <select
              id="newDay"
              name="newDay"
              value={newPeriodData.day}
              onChange={(e) =>
                setNewPeriodData({ ...newPeriodData, day: e.target.value })
              }
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            >
              <option hidden>select a day </option>
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="newPeriod"
              className="block text-sm font-medium text-gray-700"
            >
              Period:
            </label>
            <select
              id="newPeriod"
              name="newPeriod"
              value={newPeriodData.period}
              onChange={(e) => handlePeriodChange(e, false)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            >
              <option hidden>select a period </option>
              {Array.from({ length: 9 }).map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  Period {index + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="newStartTime"
              className="block text-sm font-medium text-gray-700"
            >
              Start Time:
            </label>
            <input
              type="text"
              id="newStartTime"
              name="newStartTime"
              value={tConvert(newPeriodData.startTime)}
              readOnly
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="newEndTime"
              className="block text-sm font-medium text-gray-700"
            >
              End Time:
            </label>
            <input
              type="text"
              id="newEndTime"
              name="newEndTime"
              value={tConvert(newPeriodData.endTime)}
              readOnly
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Add Period
          </button>
        </form>
      )}
    </div>
  );
};

export default EditPeriod;
