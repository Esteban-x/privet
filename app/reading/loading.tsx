export default function ReadingLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="skeleton h-3 w-24 rounded-full" />
      <div className="mt-8 flex items-center gap-3">
        <div className="skeleton h-5 w-12 rounded-full" />
        <div className="skeleton h-10 w-64 rounded-lg" />
      </div>
      <div className="mt-8 space-y-4 rounded-[20px] border border-border bg-bg2 p-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-6 rounded-lg" style={{ width: `${85 - i * 8}%` }} />
        ))}
      </div>
    </div>
  );
}
