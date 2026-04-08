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

export function MineSupportBlock() {
  return (
    <section
      aria-label="Mine support"
      className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 lg:px-8"
    >
      <div className="observatory-panel observatory-frame rounded-2xl border border-line-steel/40 px-4 py-4 sm:px-5 sm:py-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-cold-cyan/75">
              Support
            </p>
            <h3 className="mt-1 text-sm font-semibold text-text-primary sm:text-base">
              Scan guidance and system notes.
            </h3>
          </div>
          <p className="max-w-md text-xs leading-5 text-text-secondary/75 sm:text-sm">
            Quiet guidance for the current sector. Keep the main stage in focus
            and use this block for orientation only.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <SupportTile
            title="How it works"
            copy="Select a target, review the detail panel, and use reroll only when you need a fresh sector."
          />
          <SupportTile
            title="System note"
            copy="Pink signal energy stays concentrated on the selected vein and the primary mine action."
          />
        </div>
      </div>
    </section>
  );
}
