export function SkeletonRow() {
  return (
    <div className="animate-pulse rounded-xl border border-line-steel/20 bg-surface-1/40 p-4">
      <div className="mb-2 h-4 w-2/3 rounded bg-surface-2/60" />
      <div className="h-3 w-1/3 rounded bg-surface-2/40" />
    </div>
  );
}
