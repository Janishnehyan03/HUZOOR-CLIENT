import React from "react";

const NotFoundPage: React.FC = () => {
  const goHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        Oops! Page not found.
      </h2>
      <p className="text-gray-600 mb-8">
        The page you're looking for doesn't exist. The URL may be incorrect or
        the page may have been removed.
      </p>
      <button
        onClick={goHome}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Go Home
      </button>
    </div>
  );
};

export default NotFoundPage;
