import React, { ReactNode, createContext, useContext, useState, useEffect } from "react";
import Axios from "../Axios";

interface User {
  name: string;
  email: string;
  role: string;
  profileImage: string;
  isActive: boolean;
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
    if (!token || token === "null" || token === "undefined") {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await Axios.post("/teacher/check-login", { token });
      if (response.data?.loggedIn && response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
        localStorage.removeItem("token");
      }
    } catch (error: any) {
      console.log(error?.response || error);
      setUser(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
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
