import React, { ReactNode, createContext, useContext, useState, useEffect } from "react";
import Axios from "../Axios";

interface User {
  name: string;
  email: string;
  role: string;
  profileImage: string;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  checkUserLoggedIn: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Added loading state

  const checkUserLoggedIn = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false); // No token, no need to call the server
      return;
    }

    try {
      setLoading(true); // Start loading
      const response = await Axios.post("/teacher/check-login", { token });
      setUser(response.data.user);

      if (!response.data.loggedIn) {
        localStorage.clear();
        window.location.href = "/login"; // Redirect if not logged in
      }
    } catch (error: any) {
      console.log(error.response);
      localStorage.clear();
      window.location.href = "/login"; // Handle any errors by redirecting to login
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    checkUserLoggedIn(); // Trigger check on mount
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, checkUserLoggedIn, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
