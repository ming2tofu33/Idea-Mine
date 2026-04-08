function PanelChrome({
  label,
  title,
  count,
}: {
  label: string;
  title: string;
  count?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-text-secondary/70">
          {label}
        </p>
        <h3 className="mt-1 text-base font-semibold tracking-tight text-text-primary">
          {title}
        </h3>
      </div>
      {count ? (
        <span className="rounded-full border border-line-steel/45 bg-bg-deep/50 px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] text-text-secondary">
          {count}
        </span>
      ) : null}
    </div>
  );
}

function MineSlice() {
  return (
    <div className="observatory-frame rounded-2xl border border-line-steel/35 bg-surface-1/55 p-4">
      <PanelChrome label="Mine Slice" title="Vein scan" count="3 active" />

      <div className="space-y-3">
        <div className="rounded-xl border border-line-steel/30 bg-bg-base/70 p-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.22em] text-cold-cyan/75">
              Sector scan
            </span>
            <span className="text-[10px] text-text-secondary/60">92% stable</span>
          </div>
          <div className="space-y-2">
            {[
              { label: "Neon Relay", tone: "High confidence" },
              { label: "Signal Drift", tone: "Needs review" },
              { label: "Field Notes", tone: "Low noise" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg border border-line-steel/20 bg-surface-1/55 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {item.label}
                  </p>
                  <p className="text-xs text-text-secondary">{item.tone}</p>
                </div>
                <span className="rounded-full border border-cold-cyan/25 bg-cold-cyan/10 px-2 py-0.5 text-[10px] text-cold-cyan">
                  Open
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {["Reroll", "Mine", "Review"].map((label, index) => (
            <div
              key={label}
              className={[
                "rounded-lg border px-2 py-2 text-center text-[10px] uppercase tracking-[0.2em]",
                index === 1
                  ? "border-signal-pink/35 bg-signal-pink/10 text-signal-pink"
                  : "border-line-steel/30 bg-surface-2/40 text-text-secondary",
              ].join(" ")}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VaultSlice() {
  return (
    <div className="observatory-frame rounded-2xl border border-line-steel/35 bg-surface-1/55 p-4">
      <PanelChrome label="Vault Slice" title="Archived ideas" count="6 cards" />

      <div className="space-y-2">
        {[
          {
            title: "Idea Atlas",
            meta: "Strategy / selected / later",
            chips: ["Found", "Kept", "Ready"],
          },
          {
            title: "Signal Index",
            meta: "Product / validated / pinned",
            chips: ["Mature", "Tagged", "Shared"],
          },
          {
            title: "Relay Drafts",
            meta: "Ops / watchlist / queued",
            chips: ["Draft", "Context", "Review"],
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-line-steel/25 bg-bg-deep/65 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">
                  {item.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-text-secondary">
                  {item.meta}
                </p>
              </div>
              <span className="mt-0.5 rounded-full border border-cold-cyan/25 bg-cold-cyan/10 px-2 py-0.5 text-[10px] text-cold-cyan">
                Saved
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-line-steel/30 bg-surface-1/55 px-2 py-1 text-[10px] text-text-secondary"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LabSlice() {
  return (
    <div className="observatory-frame rounded-2xl border border-line-steel/35 bg-surface-1/55 p-4">
      <PanelChrome label="Lab Slice" title="Overview queue" count="2 live" />

      <div className="space-y-2">
        {[
          {
            title: "Aurora pricing note",
            detail: "Overview ready",
            state: "Lab",
          },
          {
            title: "Retention loop sketch",
            detail: "Needs refinement",
            state: "Queue",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-between rounded-xl border border-line-steel/25 bg-bg-deep/65 p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text-primary">
                {item.title}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">{item.detail}</p>
            </div>
            <span className="shrink-0 rounded-full border border-signal-pink/25 bg-signal-pink/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-signal-pink">
              {item.state}
            </span>
          </div>
        ))}

        <div className="rounded-xl border border-dashed border-line-steel/30 bg-surface-2/20 px-3 py-2 text-xs text-text-secondary">
          Lab turns selected ideas into working direction.
        </div>
      </div>
    </div>
  );
}

export function ProductProof() {
  return (
    <section
      id="product-proof"
      aria-label="Product proof"
      className="relative z-10 readable-container py-4 md:py-5"
    >
      <div className="observatory-panel observatory-frame rounded-3xl p-5 sm:p-6 lg:p-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-cold-cyan/80">
              Product Proof
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
              Real UI slices, not mock marketing.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-text-secondary">
            These frames mirror the density of the app: status, lists, chips, and
            action surfaces.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <MineSlice />
          <VaultSlice />
          <LabSlice />
        </div>
      </div>
    </section>
  );
}
