type MineSupportStatus = "loading" | "error" | "empty" | "ready";

function SupportTile({
  title,
  copy,
}: {
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-xl border border-line-steel/30 bg-bg-deep/55 p-3.5">
      <p className="text-[10px] uppercase tracking-[0.24em] text-text-secondary/70">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-text-primary/90">{copy}</p>
    </div>
  );
}

type MineSupportBlockProps = {
  status: MineSupportStatus;
};

const SUPPORT_COPY: Record<
  MineSupportStatus,
  { eyebrow: string; title: string; intro: string; primary: string; secondary: string }
> = {
  loading: {
    eyebrow: "Support",
    title: "Scan guidance and system notes.",
    intro: "The field is warming up. Use this block for orientation while the stage resolves.",
    primary: "How it works",
    secondary: "Wait for the sector scan to settle before choosing a target.",
  },
  error: {
    eyebrow: "Support",
    title: "Scan guidance and recovery notes.",
    intro: "The field lost signal. This block stays calm and only explains the next safe step.",
    primary: "How it works",
    secondary: "Use reroll to recover the sector, then reassess the targets.",
  },
  empty: {
    eyebrow: "Support",
    title: "Scan guidance and system notes.",
    intro: "No target is available yet. Keep this block as orientation while the sector repopulates.",
    primary: "How it works",
    secondary: "Wait for a fresh sector before selecting a target.",
  },
  ready: {
    eyebrow: "Support",
    title: "Scan guidance and system notes.",
    intro: "Quiet guidance for the current sector. Keep the main stage in focus and use this block for orientation only.",
    primary: "How it works",
    secondary: "Select a target, review the detail panel, and reroll only when you need a fresh sector.",
  },
};

export function MineSupportBlock({ status }: MineSupportBlockProps) {
  const copy = SUPPORT_COPY[status];

  return (
    <section
      aria-label="Mine support"
      className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 lg:px-8"
    >
      <div className="observatory-panel observatory-frame rounded-2xl border border-line-steel/40 px-4 py-4 sm:px-5 sm:py-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-cold-cyan/75">{copy.eyebrow}</p>
            <h3 className="mt-1 text-sm font-semibold text-text-primary sm:text-base">
              {copy.title}
            </h3>
          </div>
          <p className="max-w-md text-xs leading-5 text-text-secondary/75 sm:text-sm">
            {copy.intro}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <SupportTile title={copy.primary} copy={copy.secondary} />
          <SupportTile
            title="System note"
            copy={
              status === "ready"
                ? "Pink signal energy stays concentrated on the selected vein and the primary mine action."
                : status === "loading"
                  ? "No target is locked yet, so the support block stays informational."
                  : status === "error"
                    ? "Use reroll to recover the sector before trying another selection."
                    : "A fresh sector will appear here once the scan resolves."
            }
          />
        </div>
      </div>
    </section>
  );
}
