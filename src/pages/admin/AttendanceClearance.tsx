import { useState } from "react";
import Axios from "../../Axios";
import Loading from "../../components/Loading";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import toast from "react-hot-toast";

dayjs.extend(localizedFormat);

function AttendanceClearance() {
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [student, setStudent] = useState<any>();
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [reason, setReason] = useState<"medical" | "official">("medical");
  const [submitting, setSubmitting] = useState(false);

  const handleFetchStudentData = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await Axios.get(
        `/attendance/student/attendances?admissionNumber=${admissionNumber}`
      );

      setStudentData(data.attendanceData);
      setStudent(data.student);
    } catch (err) {
      setError("Error fetching student data");
      console.error("Error fetching student data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (date: string) => {
    const currentIndex = selectedDates.indexOf(date);
    if (currentIndex === -1) {
      setSelectedDates([...selectedDates, date]);
    } else {
      const newSelected = [...selectedDates];
      newSelected.splice(currentIndex, 1);
      setSelectedDates(newSelected);
    }
  };

  const handleReasonChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setReason(event.target.value as "medical" | "official");
  };

  const handleSubmit = async (e:any,studentId: string) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await Axios.patch(
        `/attendance/clear/attendance/${studentId}`,

        {
          admissionNumber,
          dates: selectedDates,
          reason,
        }
      );
      if (response.status === 200) {
        toast.success("Attendance cleared succesfully");
        window.location.reload();
      }

      // Optionally, you can reset the component state or show a success message.
    } catch (error) {
      console.error("Error clearing attendance:", error);
      // Handle error appropriately, e.g., show an error message.
    } finally {
      setSubmitting(false);
    }
  };

  const uniqueDates = studentData
    ? studentData.reduce((unique: any, date: any) => {
        const formattedDate = dayjs(date.date).format("MMMM D, YYYY");
        if (!unique.includes(formattedDate)) {
          unique.push(formattedDate);
        }
        return unique;
      }, [] as string[])
    : [];

  return (
    <div className="container mx-auto px-4 py-8 lg:w-2/3">
      <h2 className="text-3xl font-semibold mb-6 text-teal-600">
        Attendance Clearance
      </h2>
      <div className="flex items-center mb-6">
        <input
          type="text"
          className="w-full py-3 px-4 rounded-lg border-2 border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-lg"
          placeholder="Enter Student Admission Number"
          value={admissionNumber}
          onChange={(e) => setAdmissionNumber(e.target.value)}
        />
        <button
          onClick={handleFetchStudentData}
          className="ml-2 py-3 px-2 w-1/4 bg-teal-500 text-white rounded-lg text-lg font-semibold hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-opacity-50"
          disabled={loading}
        >
          {loading ? "Fetching..." : "Fetch Data"}
        </button>
      </div>
      {loading && <Loading />}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {studentData && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-teal-600 mb-4">
            Student Information
          </h3>
          <p>
            <strong>Name:</strong> {student.name}
          </p>
          <p>
            <strong>Class:</strong> {student.class.name}
          </p>
          <p>
            <strong>Admission Number:</strong> {student.admissionNumber}
          </p>
          <h4 className="text-xl font-semibold text-teal-600 mt-4 mb-2">
            Absence Dates
          </h4>
          {uniqueDates.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {uniqueDates.map((date: string, index: number) => (
                <div key={index}>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      value={date}
                      checked={selectedDates.includes(date)}
                      onChange={() => handleCheckboxChange(date)}
                    />
                    {date}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <p>No absences recorded.</p>
          )}

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              Select Reason:
            </label>
            <select
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              value={reason}
              onChange={handleReasonChange}
            >
              <option value="medical">Medical</option>
              <option value="official">Official</option>
            </select>
          </div>

          <button
            onClick={(e) => handleSubmit(e,student._id)}
            className="mt-6 py-3 px-4 bg-teal-500 text-white rounded-lg text-lg font-semibold hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-opacity-50"
            disabled={submitting || selectedDates.length === 0}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      )}
    </div>
  );
}

export default AttendanceClearance;
