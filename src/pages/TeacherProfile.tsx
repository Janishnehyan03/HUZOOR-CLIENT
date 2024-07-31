import { UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "../Axios";

interface TeacherProfileProps {
  name: string;
  profileImage: string;
  role: string;
  subjects: any[];
}

const TeacherProfile = () => {
  const { teacherId } = useParams();
  const [teacher, setTeacher] = useState<TeacherProfileProps>();
  const [subjects, setSubjects] = useState<any>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const getTeacher = async () => {
    try {
      let { data } = await Axios.get(`/teacher/${teacherId}`);
      setTeacher(data.teacher);
      setSubjects(data.subjects);
    } catch (error: any) {
      console.log(error.response);
    }
  };

  useEffect(() => {
    getTeacher();
  }, [teacherId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("my_file", selectedFile);

    try {
      const response = await Axios.post(`/teacher/upload/${teacherId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setTeacher(response.data);
      setSelectedFile(null); // Clear the selected file
      window.location.reload(); // Reload the page after successful upload
    } catch (error: any) {
      console.log(error.response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-gray-100 shadow-lg rounded-lg overflow-hidden border-2 border-green-400 mt-10">
      {teacher?.profileImage ? (
        <img
          className="w-full h-40 object-contain rounded-full"
          src={teacher?.profileImage}
          alt={teacher?.name}
        />
      ) : (
        <UserCircle className="w-full h-40 text-gray-400 my-6" />
      )}
      <div className="p-6 bg-white text-gray-900">
        <h2 className="text-2xl font-bold">{teacher?.name}</h2>
        <p className="text-md uppercase bg-green-100 text-green-500 p-2 my-2 rounded-lg">
          {teacher?.role}
        </p>
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Subjects</h3>
          <div className="mt-2">
            {subjects?.map((subject: any, index: any) => (
              <p
                key={index}
                className="bg-teal-700 text-white p-2 my-1 rounded-lg"
              >
                {subject?.name}
              </p>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="fileInput"
          >
            Upload Profile Picture
          </label>
          <input
            type="file"
            id="fileInput"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          <button
            onClick={handleFileUpload}
            className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
