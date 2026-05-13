export function SkeletonCard() {
  return (
    <div className="desktop-instrument-flat flex min-h-64 animate-pulse flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="h-5 w-3/4 bg-surface-2/60" />
        <div className="h-4 w-4 shrink-0 bg-surface-2/40" />
      </div>
      <div className="mt-3 h-4 w-full bg-surface-2/50" />
      <div className="mt-3 flex-1 space-y-2">
        <div className="h-4 w-full bg-surface-2/40" />
        <div className="h-4 w-2/3 bg-surface-2/40" />
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <div className="h-6 w-16 bg-surface-2/35" />
        <div className="h-6 w-20 bg-surface-2/35" />
        <div className="h-6 w-14 bg-surface-2/35" />
      </div>
      <div className="mt-5 border-t border-line-steel/25 pt-4">
        <div className="h-3 w-28 bg-surface-2/45" />
      </div>
    </div>
  );
}
