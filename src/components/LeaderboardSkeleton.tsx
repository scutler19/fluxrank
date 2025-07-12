export default function LeaderboardSkeleton() {
  return (
    <div className="animate-pulse">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="border-b border-neutral-700 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-neutral-900 rounded-full" />
              <div>
                <div className="h-5 bg-neutral-900 rounded w-32 mb-2" />
                <div className="h-4 bg-neutral-900 rounded w-48" />
              </div>
            </div>
            <div className="text-right">
              <div className="h-6 bg-neutral-900 rounded w-16 mb-1" />
              <div className="h-4 bg-neutral-900 rounded w-12" />
            </div>
          </div>
          <div className="mt-3 flex space-x-4">
            <div className="h-4 bg-neutral-900 rounded w-20" />
            <div className="h-4 bg-neutral-900 rounded w-20" />
            <div className="h-4 bg-neutral-900 rounded w-20" />
            <div className="h-4 bg-neutral-900 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  )
} 