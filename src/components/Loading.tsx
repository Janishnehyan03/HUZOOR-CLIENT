function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-50 backdrop-blur-sm">
      <div className="relative">
        {/* Outer ring with subtle animation */}
        <div className="w-24 h-24 rounded-full border-4 border-gray-100"></div>

        {/* Animated spinner with gradient */}
        <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-blue-500/5"></div>
        </div>

        {/* Optional center icon or logo */}
        <div className="absolute inset-4 flex items-center justify-center">
          {/* Replace with your logo or icon if desired */}
          <svg
            className="w-8 h-8 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
        </div>
      </div>

      {/* Message with better typography and animation */}
      <p className="mt-6 text-gray-700 font-medium text-lg tracking-wide">
        <span className="inline-block animate-pulse [animation-delay:100ms]">
          L
        </span>
        <span className="inline-block animate-pulse [animation-delay:200ms]">
          o
        </span>
        <span className="inline-block animate-pulse [animation-delay:300ms]">
          a
        </span>
        <span className="inline-block animate-pulse [animation-delay:400ms]">
          d
        </span>
        <span className="inline-block animate-pulse [animation-delay:500ms]">
          i
        </span>
        <span className="inline-block animate-pulse [animation-delay:600ms]">
          n
        </span>
        <span className="inline-block animate-pulse [animation-delay:700ms]">
          g
        </span>
        <span className="inline-block">...</span>
      </p>

      {/* Optional progress indicator */}
      <div className="mt-4 w-48 bg-gray-200 rounded-full h-1.5">
        <div className="bg-blue-500 h-1.5 rounded-full animate-progress"></div>
      </div>
    </div>
  );
}

export default Loading;
