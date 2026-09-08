import React, { useEffect } from "react";
import { Navigate, Outlet,  } from "react-router-dom";
import Axios from "../Axios";
import { useAuth } from "../contexts/userContext";
import Footer from "./Footer";
import Header from "./Header";

const PrivateRoutes: React.FC = () => {
  const token = localStorage.getItem("token");
  const isValidToken = token && token !== "null" && token !== "undefined";
  const { setUser } = useAuth();

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
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default PrivateRoutes;
