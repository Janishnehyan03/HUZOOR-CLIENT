import axios from "axios";

// Create an instance of Axios
const Axios = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Set the base URL for requests
  headers: {
    "Content-Type": "application/json", // Set default Content-Type header
  },
  withCredentials: true,
});

Axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && token !== "null" && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

export default Axios;
