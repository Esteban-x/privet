export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-12">
      <div className="mb-7 sm:mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="skeleton h-4 w-32 rounded-full" />
          <div className="skeleton mt-3 h-10 w-64 rounded-lg" />
        </div>
        <div className="skeleton h-11 w-56 rounded-[10px]" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[20px] surface p-5">
            <div className="skeleton h-3 w-20 rounded-full" />
            <div className="skeleton mt-2 h-8 w-16 rounded-lg" />
          </div>
        ))}
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="mt-6 rounded-[20px] surface p-6">
          <div className="skeleton h-4 w-40 rounded-full" />
          <div className="skeleton mt-4 h-2.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}
