export default function AboutLoading() {
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
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="h-10 w-48 bg-gray-800 animate-pulse rounded mx-auto mb-8"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Skeleton */}
          <div className="aspect-square bg-gray-800 animate-pulse rounded-lg"></div>

          {/* Text Skeleton */}
          <div className="space-y-4">
            <div className="h-4 bg-gray-800 animate-pulse rounded w-full"></div>
            <div className="h-4 bg-gray-800 animate-pulse rounded w-full"></div>
            <div className="h-4 bg-gray-800 animate-pulse rounded w-5/6"></div>
            <div className="h-4 bg-gray-800 animate-pulse rounded w-full"></div>
            <div className="h-4 bg-gray-800 animate-pulse rounded w-4/5"></div>
            <div className="h-4 bg-gray-800 animate-pulse rounded w-full"></div>
            <div className="h-4 bg-gray-800 animate-pulse rounded w-3/4"></div>

            <div className="pt-6">
              <div className="h-6 bg-gray-800 animate-pulse rounded w-40 mb-4"></div>
              <div className="flex flex-wrap gap-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-8 w-20 bg-gray-800 animate-pulse rounded-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Skeleton - Desktop */}
        <div className="mt-16">
          <div className="h-8 w-64 bg-gray-800 animate-pulse rounded mx-auto mb-8"></div>

          {/* Desktop Timeline Skeleton */}
          <div className="hidden md:block relative">
            {/* Linha vertical centralizada */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-800"></div>

            <div className="space-y-16">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="relative flex items-center">
                  {/* Círculo centralizado na linha */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-5 h-5 rounded-full border-2 border-gray-800 bg-black"></div>

                  {/* Conteúdo à esquerda para índices pares */}
                  <div className={`w-1/2 ${i % 2 === 0 ? "pr-8 text-right" : "pl-8 left-1/2"}`}>
                    {i % 2 === 0 && (
                      <>
                        <div className="h-6 bg-gray-800 animate-pulse rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-800 animate-pulse rounded w-3/4 mb-2 ml-auto"></div>
                        <div className="h-4 bg-gray-800 animate-pulse rounded w-full"></div>
                      </>
                    )}
                  </div>

                  {/* Conteúdo à direita para índices ímpares */}
                  <div className={`w-1/2 ${i % 2 === 1 ? "pl-8" : "pr-8 text-right"}`}>
                    {i % 2 === 1 && (
                      <>
                        <div className="h-6 bg-gray-800 animate-pulse rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-800 animate-pulse rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-800 animate-pulse rounded w-full"></div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Timeline Skeleton */}
          <div className="md:hidden relative">
            {/* Linha vertical à esquerda */}
            <div className="absolute left-2.5 top-0 h-full w-0.5 bg-gray-800"></div>

            <div className="space-y-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="relative pl-10">
                  {/* Círculo na linha */}
                  <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full border-2 border-gray-800 bg-black"></div>

                  <div className="h-6 bg-gray-800 animate-pulse rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-800 animate-pulse rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-800 animate-pulse rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
