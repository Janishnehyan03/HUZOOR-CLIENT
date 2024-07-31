import axios from "axios";
// Create an instance of Axios
const Axios = axios.create({
  baseURL: "https://huzoor-server.vercel.app/api", // Set base URL for all requests
  // baseURL: "http://localhost:5000/api", // Set base URL for all requests
  timeout: 5000, // Set timeout for requests (in milliseconds)
  headers: {
    "Content-Type": "application/json", // Set default Content-Type header
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
  withCredentials: true,
});

export default Axios;
