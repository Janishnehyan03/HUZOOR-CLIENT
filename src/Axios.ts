import axios from "axios";
// Create an instance of Axios
const Axios = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Set the base URL for requests
  timeout: 5000, // Set timeout for requests (in milliseconds)
  headers: {
    "Content-Type": "application/json", // Set default Content-Type header
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
  withCredentials: true,
});

console.log(import.meta.env.VITE_API_URL);
export default Axios;