
function SkeltonLoading() {
  return (
    <div className="lg:grid lg:grid-cols-3">
      <div className="bg-white shadow-lg rounded-lg p-6 flex items-center animate-pulse">
        <div className="flex-shrink-0 bg-gray-300 h-12 w-12 rounded-full"></div>
        <div className="ml-4 flex-1">
          <div className="h-6 bg-gray-300 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
      <div className="bg-white shadow-lg rounded-lg p-6 flex items-center animate-pulse">
        <div className="flex-shrink-0 bg-gray-300 h-12 w-12 rounded-full"></div>
        <div className="ml-4 flex-1">
          <div className="h-6 bg-gray-300 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
      <div className="bg-white shadow-lg rounded-lg p-6 flex items-center animate-pulse">
        <div className="flex-shrink-0 bg-gray-300 h-12 w-12 rounded-full"></div>
        <div className="ml-4 flex-1">
          <div className="h-6 bg-gray-300 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
}

export default SkeltonLoading;
