export default function AccountLoading() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="skeleton h-3 w-24 rounded-full" />
      <div className="skeleton mt-3 h-10 w-48 rounded-lg" />

      <div className="mt-8 space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[20px] border border-border bg-bg2 p-6">
            <div className="skeleton h-5 w-40 rounded-lg" />
            <div className="skeleton mt-4 h-10 w-full max-w-sm rounded-[10px]" />
          </div>
        ))}
      </div>
    </div>
  );
}
