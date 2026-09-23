import { useState } from "react";
import { useForm } from "react-hook-form";
import Axios from "../../Axios";
import { useAuth } from "../../contexts/userContext";
import toast from "react-hot-toast";

interface PasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const App = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PasswordForm>();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user, setUser } = useAuth();
  const [isActive, setIsActive] = useState<boolean>(user?.isActive ?? true);
  const [isStatusLoading, setIsStatusLoading] = useState<boolean>(false);

  const handleStatusToggle = async () => {
    setIsStatusLoading(true);
    try {
      const newStatus = !isActive;
      const response = await Axios.patch(
        "/teacher/update-status/mine",
        { isActive: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setIsActive(newStatus);
      if (user) {
        setUser({ ...user, isActive: newStatus });
      }
      toast.success(response.data.message || "Status updated");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setIsStatusLoading(false);
    }
  };

  const onSubmit = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await Axios.patch(
        "/teacher/update-password/mine",
        {
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Adjust based on your auth setup
          },
        }
      );

      setSuccess(response.data.message);
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Update Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter your current and new password
          </p>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Availability Status</h3>
            <p className="text-sm text-gray-500">
              {isActive ? "You are currently active." : "You are currently marked as inactive."}
            </p>
          </div>
          <button
            onClick={handleStatusToggle}
            disabled={isStatusLoading}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              isActive ? "bg-indigo-600" : "bg-gray-200"
            } ${isStatusLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            role="switch"
            aria-checked={isActive}
          >
            <span className="sr-only">Toggle availability</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isActive ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="oldPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Current Password
              </label>
              <input
                id="oldPassword"
                type="password"
                {...register("oldPassword", {
                  required: "Current password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                placeholder="Enter your current password"
                className="mt-1 block p-3 w-full rounded-md border-gray-500 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.oldPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.oldPassword.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                {...register("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                placeholder="Enter your new password"
                className="mt-1 p-3 block w-full rounded-md border-gray-500 border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", {
                  required: "Please confirm your new password",
                  validate: (value) =>
                    value === watch("newPassword") || "Passwords do not match",
                })}
                placeholder="Re-enter your new password"
                className="block w-full p-3 mt-1 text-sm border-gray-500 border rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 focus:ring-offset-1 sm:text-sm transition-all duration-150"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
