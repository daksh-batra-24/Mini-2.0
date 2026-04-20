/**
 * LoadingOverlay — Full-section skeleton loader shown while the API fetches.
 */
export default function LoadingOverlay() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Chart skeleton */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
        <div className="h-5 w-48 rounded bg-white/5 animate-shimmer mb-4" />
        <div className="h-[280px] rounded-xl bg-white/[0.02] animate-shimmer flex items-center justify-center">
          <svg className="w-8 h-8 text-[var(--text-muted)] animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>

      {/* Risk section skeleton */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
        <div className="h-5 w-64 rounded bg-white/5 animate-shimmer mb-6" />
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-[180px] h-[180px] rounded-full bg-white/[0.03] animate-shimmer" />
          <div className="flex-1 space-y-3 w-full">
            <div className="h-4 w-3/4 rounded bg-white/5 animate-shimmer" />
            <div className="h-4 w-1/2 rounded bg-white/5 animate-shimmer" />
            <div className="h-4 w-2/3 rounded bg-white/5 animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
