export function SkeletonCard() {
  return (
    <div className="desktop-instrument-flat min-h-64 animate-pulse p-5">
      <div className="mb-3 h-5 w-3/4 bg-surface-2/60" />
      <div className="mb-2 h-4 w-full bg-surface-2/40" />
      <div className="mb-4 h-4 w-2/3 bg-surface-2/40" />
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 bg-surface-2/40" />
        <div className="h-3 w-16 bg-surface-2/40" />
      </div>
    </div>
  );
}
