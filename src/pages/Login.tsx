import { useState } from "react";
import Axios from "../Axios";
import toast from "react-hot-toast";

export default function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Send POST request to login endpoint
      const response = await Axios.post("/teacher/login", {
        name,
        password,
      });

      // Extract token from response
      const token = response.data.token;

      // Store token in localStorage
      localStorage.setItem("token", token);
      window.location.href = "/";
    } catch (error: any) {
      // Handle error, such as displaying an error message to the user
      console.error("Login failed:", error.response);
      toast.error(error.response.data.message && error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <img
        src="/dh-front.jpg"
        alt="Darul Huda Photo"
        className="hidden md:block md:w-2/3 h-full object-cover"
      />
      <form
        className="flex flex-col flex-grow justify-center items-center p-4 md:p-8"
        onSubmit={handleSubmit}
      >
        <img
          src="/logo.png"
          alt="Darul Huda Logo"
          className="w-32 mb-4 md:mb-6"
        />
        <h1 className="text-xl md:text-2xl text-center text-teal-700 font-bold leading-8 mb-4 md:mb-6">
          <span className="font-semibold text-gray-700">Login to</span> <br />
          HUZOOR  PORTAL
        </h1>
        <input
          type="text"
          className="font-light px-4 py-2 rounded-xl w-full max-w-xs border mb-4"
          placeholder="Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="relative w-full max-w-xs mb-4">
          <input
            type={showPassword ? "text" : "password"}
            className="font-light px-4 py-2 rounded-xl w-full border"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 px-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <button
          type="submit"
          className="font-light px-4 py-2 rounded-xl w-full max-w-xs border bg-primary text-white hover:bg-opacity-85 transition-colors duration-300"
          disabled={loading}
        >
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
}
