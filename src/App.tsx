import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";
import PrivateRoutes from "./components/ProtectedRoute"; // Assuming PrivateRoutes is in ProtectedRoute.js
import UserLayout from "./components/UserLayout";
import EditPeriod from "./components/_home/teacher/EditPeriod";
import { useAuth } from "./contexts/userContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import TeacherProfile from "./pages/TeacherProfile";
import UserHome from "./pages/UserHome";
import AddStudent from "./pages/admin/AddStudent";
import AttendanceClearance from "./pages/admin/AttendanceClearance";
import ManageAttendace from "./pages/admin/ManageAttendace";
import ManageClasses from "./pages/admin/ManageClasses";
import ManageDepartments from "./pages/admin/ManageDepartments";
import ManageStudentsAttendance from "./pages/admin/ManageStudentsAttendance";
import ManageSubject from "./pages/admin/ManageSubject";
import ManageSubjectsAttendace from "./pages/admin/ManageSubjects";
import StudentDays from "./pages/admin/StudentDays";
import StudentTable from "./pages/admin/Students";
import Subjects from "./pages/admin/Subjects";
import Teachers from "./pages/admin/Teachers";
import AttendancePage from "./pages/teacher/AttendancePage";
import EditAttendance from "./pages/teacher/EditAttendance";
import StudentAttendanceDetails from "./pages/teacher/StudentAttendanceDetails";
import SubjectAttendance from "./pages/teacher/SubjectAttendance";

function App() {
  const { checkUserLoggedIn } = useAuth();
  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  return (
    <div className="font-lato">
      <Toaster />
      {/* <Header /> */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path='*' element={<NotFound />} />
        <Route element={<PrivateRoutes />}>
          <Route path="/" element={<Home />} />
          <Route path="/manage-classes" element={<ManageClasses />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/teacher/:teacherId" element={<TeacherProfile />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/subject/:subjectId" element={<ManageSubject />} />
          <Route path="/edit-period/:subjectId" element={<EditPeriod />} />
          <Route path="/students" element={<StudentTable />} />
          <Route path="/add-student" element={<AddStudent />} />
          <Route path="/attendance/:subjectId" element={<AttendancePage />} />
          <Route path="/manage-attendance" element={<ManageAttendace />} />

          <Route
            path="/edit-attendance/:subjectId"
            element={<EditAttendance />}
          />
          <Route
            path="/subject-attendance/:subjectId"
            element={<SubjectAttendance />}
          />
          <Route
            path="/subject-attendance/:subjectId/student/:studentId"
            element={<StudentAttendanceDetails />}
          />
          <Route
            path="/manage-attendance/attendance-clearance"
            element={<AttendanceClearance />}
          />
        </Route>
        <Route element={<UserLayout />}>
          <Route path="/student" element={<UserHome />} />
          <Route
            path="/manage-attendance/students"
            element={<ManageStudentsAttendance />}
          />
          <Route
            path="/attendance-details/student/:studentId"
            element={<StudentDays />}
          />
          <Route
            path="/manage-attendance/subjects"
            element={<ManageSubjectsAttendace />}
          />
          <Route
            path="/manage-attendance/departments"
            element={<ManageDepartments />}
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
