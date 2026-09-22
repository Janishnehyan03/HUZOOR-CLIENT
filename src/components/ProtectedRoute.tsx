import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Axios from "../Axios";
import { useAuth } from "../contexts/userContext";
import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";

const PrivateRoutes: React.FC = () => {
  const token = localStorage.getItem("token");
  const isValidToken = token && token !== "null" && token !== "undefined";
  const { setUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkLoggedIn = async () => {
      if (!isValidToken) return;

      try {
        const response = await Axios.post("/teacher/check-login", { token });
        if (response.data?.loggedIn && response.data?.user) {
          setUser(response.data.user);
        } else {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } catch (error: any) {
        console.log(error?.response || error);
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    };

    checkLoggedIn();
  }, [token]);

  return isValidToken ? (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default PrivateRoutes;
