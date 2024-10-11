import React, { createContext, useContext, useEffect, useState } from "react";
import Axios from "../Axios";

// Create a context
const DashboardContext = createContext<any>(null);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const { data } = await Axios.get("/details");
        
        setDetails(data);
      } catch (error: any) {
        console.error(error.response);
      }
    };

    getData();
  }, []); // Fetch data only once

  return (
    <DashboardContext.Provider value={details}>
      {children}
    </DashboardContext.Provider>
  );
};

// Create a hook for easy access
export const useDashboardData = () => {
  return useContext(DashboardContext);
};
