
function Loading({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 border-t-blue-500"></div>
      <p className="mt-4 text-lg font-semibold text-gray-600">{message}</p>
    </div>
  );
}

export default Loading;
