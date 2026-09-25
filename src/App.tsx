import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Route, Routes, Navigate } from "react-router-dom";
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
import TeachersList from "./pages/teacher/TeachersList";
import Downloads from "./pages/admin/Downloads";
import SettingsPage from "./pages/admin/SettingsPage";
import MinusAttendancePage from "./pages/admin/MinusAttendance";
import MonthlyReport from "./pages/admin/MonthlyReport";

function App() {
  const { checkUserLoggedIn, user } = useAuth();
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
          <Route path="/downloads" element={user?.role === "admin" ? <Downloads /> : <Navigate to="/" replace />} />
          <Route path="/manage-classes" element={user?.role === "admin" ? <ManageClasses /> : <Navigate to="/" replace />} />
          <Route path="/teachers" element={user?.role === "admin" ? <Teachers /> : <TeachersList />} />
          <Route path="/teacher/:teacherId" element={user?.role === "admin" ? <TeacherProfile /> : <Navigate to="/" replace />} />
          <Route path="/subjects" element={user?.role === "admin" ? <Subjects /> : <Navigate to="/" replace />} />
          <Route path="/subject/:subjectId" element={user?.role === "admin" ? <ManageSubject /> : <Navigate to="/" replace />} />
          <Route path="/edit-period/:subjectId" element={<EditPeriod />} />
          <Route path="/students" element={user?.role === "admin" ? <StudentTable /> : <Navigate to="/" replace />} />
          <Route path="/add-student" element={user?.role === "admin" ? <AddStudent /> : <Navigate to="/" replace />} />
          <Route path="/attendance/:subjectId" element={<AttendancePage />} />
          <Route path="/manage-attendance" element={user?.role === "admin" ? <ManageAttendace /> : <Navigate to="/" replace />} />
          <Route path="/minus-attendance" element={user?.role === "admin" ? <MinusAttendancePage /> : <Navigate to="/" replace />} />
          <Route path="/monthly-report" element={user?.role === "admin" ? <MonthlyReport /> : <Navigate to="/" replace />} />

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
            element={user?.role === "admin" ? <AttendanceClearance /> : <Navigate to="/" replace />}
          />
        </Route>
        <Route element={<UserLayout />}>
          <Route path="/student" element={<UserHome />} />
          <Route
            path="/manage-attendance/students"
            element={user?.role === "admin" ? <ManageStudentsAttendance /> : <Navigate to="/" replace />}
          />
          <Route
            path="/attendance-details/student/:studentId"
            element={user?.role === "admin" ? <StudentDays /> : <Navigate to="/" replace />}
          />
          <Route
            path="/manage-attendance/subjects"
            element={user?.role === "admin" ? <ManageSubjectsAttendace /> : <Navigate to="/" replace />}
          />
          <Route
            path="/manage-attendance/departments"
            element={user?.role === "admin" ? <ManageDepartments /> : <Navigate to="/" replace />}
          />
          <Route
            path="/settings"
            element={<SettingsPage />}
          />
          <Route
            path="/teachers-list"
            element={<TeachersList />}
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
