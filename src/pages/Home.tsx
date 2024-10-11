import SkeltonLoading from "../components/SkeltonLoading";
import AdminCards from "../components/_home/admin/AdminCards";
import TeacherCards from "../components/_home/teacher/TeacherCards";
import { useAuth } from "../contexts/userContext";
export default function Home() {
  const { user } = useAuth();

  if (!user) {
    return <SkeltonLoading />;
  }

  return (
    <div>{user?.role === "admin" ? <AdminCards /> : <TeacherCards />}</div>
  );
}
