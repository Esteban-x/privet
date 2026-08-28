export default function CasePracticeLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8 sm:py-16">
      <div className="skeleton h-3 w-24 rounded-full" />

      <div className="mb-3 mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <div className="skeleton h-10 w-40 rounded-lg" />
        <div className="skeleton h-6 w-32 rounded-lg" />
      </div>
      <div className="skeleton mb-7 sm:mb-10 h-4 w-full max-w-2xl rounded-lg" />

      <div className="rounded-[20px] surface p-8">
        <div className="skeleton h-4 w-24 rounded-full" />
        <div className="skeleton mt-4 h-8 w-4/5 rounded-lg" />
        <div className="skeleton mt-3 h-4 w-2/5 rounded-lg" />
        <div className="skeleton mt-6 h-[50px] w-full rounded-[10px]" />
      </div>
    </div>
  );
}
