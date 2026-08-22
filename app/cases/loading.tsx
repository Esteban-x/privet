export default function CasesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="skeleton h-3 w-20 rounded-full" />
      <div className="skeleton mt-3 h-10 w-96 max-w-full rounded-lg" />
      <div className="skeleton mt-4 h-4 w-full max-w-2xl rounded-lg" />
      <div className="skeleton mt-2 h-4 w-2/3 max-w-xl rounded-lg" />

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 rounded-2xl border border-border bg-bg2 p-6">
            <div className="skeleton h-11 w-11 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton h-3 w-24 rounded-full" />
              <div className="skeleton h-5 w-32 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
