export default function ArchiveLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Skeleton */}
      <div className="bg-gray-900 border-b border-gray-800 py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="h-6 w-32 bg-gray-800 animate-pulse rounded"></div>
          <div className="h-10 w-28 bg-gray-800 animate-pulse rounded"></div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-10 w-64 bg-gray-800 animate-pulse rounded mb-8"></div>

        {/* Filter Skeleton */}
        <div className="h-16 bg-gray-900 animate-pulse rounded-lg mb-8"></div>

        {/* Posts Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4 animate-pulse">
              <div className="h-7 bg-gray-800 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-800 rounded w-1/2 mb-4"></div>
              <div className="space-y-2 mb-6">
                <div className="h-4 bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-800 rounded w-2/3"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-800 rounded w-16"></div>
                <div className="h-6 bg-gray-800 rounded w-16"></div>
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t border-gray-800">
                <div className="flex gap-4">
                  <div className="h-5 w-12 bg-gray-800 rounded"></div>
                  <div className="h-5 w-12 bg-gray-800 rounded"></div>
                </div>
                <div className="h-5 w-20 bg-gray-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
