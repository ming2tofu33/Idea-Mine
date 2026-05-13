export function SkeletonRow() {
  return (
    <div className="desktop-instrument-flat relative flex animate-pulse items-stretch gap-4 overflow-hidden p-4 sm:p-5">
      <span className="absolute inset-y-0 left-0 w-px bg-line-steel/45" />
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="h-5 w-2/3 bg-surface-2/70" />
        <div className="mt-3 h-3 w-full bg-surface-2/45" />
        <div className="mt-2 h-3 w-1/2 bg-surface-2/35" />
      </div>
      <div className="h-9 w-24 shrink-0 self-center border border-line-steel/35 bg-surface-2/35 sm:w-28" />
    </div>
  );
}
