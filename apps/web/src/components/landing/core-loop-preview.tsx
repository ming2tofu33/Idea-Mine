const LOOP_STEPS = [
  {
    id: "01",
    title: "Mine",
    tone: "Scan the field",
    copy: "Pull promising signals into view.",
    accent: "cold-cyan",
  },
  {
    id: "02",
    title: "Vault",
    tone: "Keep the good ones",
    copy: "Store validated ideas with context.",
    accent: "metal-highlight",
  },
  {
    id: "03",
    title: "Lab",
    tone: "Shape the next move",
    copy: "Turn selected ideas into directions.",
    accent: "signal-pink",
  },
] as const;

function LoopNode({
  id,
  title,
  tone,
  copy,
  accent,
}: (typeof LOOP_STEPS)[number]) {
  return (
    <div className="observatory-frame rounded-2xl border border-line-steel/40 bg-surface-1/55 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="rounded-full border border-line-steel/50 bg-bg-deep/50 px-2.5 py-1 text-[10px] font-semibold tracking-[0.22em] text-text-secondary">
          {id}
        </span>
        <span
          className={[
            "text-[10px] uppercase tracking-[0.2em]",
            accent === "signal-pink"
              ? "text-signal-pink/80"
              : accent === "cold-cyan"
                ? "text-cold-cyan/80"
                : "text-metal-highlight/80",
          ].join(" ")}
        >
          {tone}
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold tracking-tight text-text-primary">
          {title}
        </h3>
        <p className="max-w-[24ch] text-sm leading-relaxed text-text-secondary">
          {copy}
        </p>
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="relative flex items-center justify-center py-2 lg:py-0">
      <div className="hidden h-px w-10 bg-line-steel/45 lg:block" />
      <span className="rounded-full border border-line-steel/40 bg-bg-deep/80 px-2 py-1 text-[10px] uppercase tracking-[0.24em] text-text-secondary/70 lg:absolute">
        Flow
      </span>
    </div>
  );
}

export function CoreLoopPreview() {
  return (
    <section
      id="core-loop"
      aria-label="Core loop preview"
      className="relative z-10 readable-container py-4 md:py-5"
    >
      <div className="observatory-panel observatory-frame rounded-3xl p-5 sm:p-6 lg:p-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-cold-cyan/80">
              Core Loop
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
              One connected system.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-text-secondary">
            Mine, Vault, and Lab are linked stages, not separate features.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
          <LoopNode {...LOOP_STEPS[0]} />
          <Connector />
          <LoopNode {...LOOP_STEPS[1]} />
          <Connector />
          <LoopNode {...LOOP_STEPS[2]} />
        </div>
      </div>
    </section>
  );
}
