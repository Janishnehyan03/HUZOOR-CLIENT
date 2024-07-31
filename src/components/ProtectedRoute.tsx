import React, { useEffect } from "react";
import { Navigate, Outlet,  } from "react-router-dom";
import Axios from "../Axios";
import { useAuth } from "../contexts/userContext";
import Footer from "./Footer";
import Header from "./Header";

const PrivateRoutes: React.FC = () => {
  const token = localStorage.getItem("token");
  const { setUser } = useAuth();

  useEffect(() => {
    const checkLoggedIn = async () => {
      // Get token from localStorage

      try {
        // Send token to server to check login status
        const response = await Axios.post("/teacher/check-login", { token });
        setUser(response.data.user);
        if (!response.data.loggedIn) {
          localStorage.clear();
          window.location.href = "/login";
        }
      } catch (error: any) {
        console.log(error.response);
      }
    };

    checkLoggedIn();
  }, []);



  return token ? (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  ) : (
    <Navigate to="/login" />
  );
};

export default PrivateRoutes;
