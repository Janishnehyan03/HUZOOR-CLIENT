
function SkeltonLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
      {/* Hero Banner Skeleton */}
      <div className="h-44 rounded-3xl bg-slate-200/80 w-full"></div>

      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200/80 p-5 flex justify-between items-center shadow-xs">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded-md"></div>
              <div className="h-7 w-14 bg-slate-300 rounded-md"></div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-slate-200"></div>
          </div>
        ))}
      </div>

      {/* Quick Action Modules Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 rounded-2xl bg-white border border-slate-200/80 p-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="h-11 w-11 rounded-xl bg-slate-200"></div>
              <div className="h-5 w-32 bg-slate-300 rounded-md"></div>
              <div className="h-4 w-full bg-slate-200 rounded-md"></div>
            </div>
            <div className="h-4 w-24 bg-slate-200 rounded-md pt-2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkeltonLoading;
