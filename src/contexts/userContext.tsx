import React, { ReactNode, createContext, useContext, useState } from "react";
import Axios from "../Axios";

interface User {
  name: string;
  email: string;
  role:string;
  profileImage:string
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  checkUserLoggedIn: any;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const checkUserLoggedIn = async () => {
    const token = localStorage.getItem("token");
    try {
      // Send token to server to check login status
      const response = await Axios.post("/teacher/check-login", { token });
      setUser(response.data.user);
      if (!response.data.loggedIn) {
        localStorage.clear();
        setUser(response.data.user);
        window.location.href = "/login";
      }
    } catch (error: any) {
      console.log(error.response);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, checkUserLoggedIn }}>
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
