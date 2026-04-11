export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen px-6 py-5 space-y-5 dark:bg-gray-900">
      {/* Filter buttons */}
      <div className="flex justify-end">
        <div className="flex items-center gap-1.5">
          {["7D", "30D", "90D", "1Y", "All"].map((l) => (
            <div
              key={l}
              className="h-6 w-9 rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700"
            />
          ))}
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-px bg-[#e0dfe8] rounded-md overflow-hidden border border-[#e0dfe8] lg:grid-cols-5 dark:bg-gray-700 dark:border-gray-700">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white px-4 py-3 space-y-2 dark:bg-gray-800"
          >
            <div className="h-2.5 w-20 rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700" />
            <div className="h-6 w-14 rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700" />
          </div>
        ))}
      </div>

      {/* Insight strip */}
      <div className="flex gap-5 border-b border-[#e0dfe8] pb-4 dark:border-gray-700">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-3 w-28 rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700"
          />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white border border-[#e0dfe8] rounded-md p-4 space-y-3 dark:bg-gray-800 dark:border-gray-700">
          <div className="h-2.5 w-24 rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700" />
          <div className="h-[200px] rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700" />
        </div>
        <div className="bg-white border border-[#e0dfe8] rounded-md p-4 space-y-3 dark:bg-gray-800 dark:border-gray-700">
          <div className="h-2.5 w-20 rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700" />
          <div className="h-[140px] rounded-full w-[140px] mx-auto bg-[#f0eef5] animate-pulse dark:bg-gray-700" />
          <div className="space-y-2 mt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-2.5 w-20 rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700" />
                <div className="h-2.5 w-8 rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Line chart */}
      <div className="bg-white border border-[#e0dfe8] rounded-md p-4 space-y-3 dark:bg-gray-800 dark:border-gray-700">
        <div className="h-2.5 w-28 rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700" />
        <div className="h-[120px] rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700" />
      </div>

      {/* Tables */}
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, t) => (
          <div
            key={t}
            className="bg-white border border-[#e0dfe8] rounded-md overflow-hidden dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="px-4 py-3 border-b border-[#e0dfe8] dark:border-gray-700">
              <div className="h-2.5 w-24 rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700" />
            </div>
            <div className="divide-y divide-[#f0eef5] dark:divide-gray-700">
              {Array.from({ length: 4 }).map((_, r) => (
                <div key={r} className="px-4 py-2.5 flex gap-4">
                  <div className="h-2.5 w-24 rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700" />
                  <div className="h-2.5 w-10 rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700" />
                  <div className="h-2.5 w-16 rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700" />
                  <div className="h-2.5 w-10 rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recent requisitions */}
      <div className="bg-white border border-[#e0dfe8] rounded-md overflow-hidden dark:bg-gray-800 dark:border-gray-700">
        <div className="px-4 py-3 border-b border-[#e0dfe8] dark:border-gray-700">
          <div className="h-2.5 w-36 rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700" />
        </div>
        <div className="divide-y divide-[#f0eef5] dark:divide-gray-700">
          {Array.from({ length: 5 }).map((_, r) => (
            <div key={r} className="px-4 py-2.5 flex gap-6 items-center">
              <div className="h-2.5 w-36 rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700" />
              <div className="h-2.5 w-20 rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700" />
              <div className="h-2.5 w-20 rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700" />
              <div className="h-2.5 w-16 rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700" />
              <div className="h-2.5 w-20 rounded bg-[#f0eef5] animate-pulse dark:bg-gray-700 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
