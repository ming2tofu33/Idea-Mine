export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-line-steel/20 bg-surface-1/40 p-5">
      <div className="mb-3 h-5 w-3/4 rounded bg-surface-2/60" />
      <div className="mb-2 h-4 w-full rounded bg-surface-2/40" />
      <div className="mb-4 h-4 w-2/3 rounded bg-surface-2/40" />
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 rounded bg-surface-2/40" />
        <div className="h-3 w-16 rounded bg-surface-2/40" />
      </div>
    </div>
  );
}
