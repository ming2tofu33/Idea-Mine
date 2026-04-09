"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Vein, VeinRarity } from "@/types/api";
import { KeywordChip } from "./keyword-chip";
import { SignalButton } from "@/components/shared/signal-button";

type SelectedVeinPanelProps = {
  vein: Vein | null;
  canMine: boolean;
  canReroll: boolean;
  isRerolling: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  warningMessage?: string;
  onMine: (id: string) => void;
  onReroll: () => void;
};

const RARITY_META: Record<
  VeinRarity,
  { label: string; accent: string; panel: string }
> = {
  common: {
    label: "Common",
    accent: "bg-text-secondary",
    panel: "border-line-steel/45 bg-surface-1/55",
  },
  rare: {
    label: "Rare",
    accent: "bg-[#8B5CF6]",
    panel: "border-[#8B5CF6]/35 bg-[rgba(139,92,246,0.06)]",
  },
  golden: {
    label: "Golden",
    accent: "bg-[#C4B07A]",
    panel: "border-[#C4B07A]/35 bg-[rgba(196,176,122,0.08)]",
  },
  legend: {
    label: "Legend",
    accent: "bg-cold-cyan",
    panel: "border-cold-cyan/35 bg-[rgba(92,205,229,0.08)]",
  },
};

const VEIN_CODENAMES = ["Alpha", "Beta", "Gamma"];

function getVeinDisplayName(vein: Vein) {
  const codename = VEIN_CODENAMES[vein.slot_index - 1] ?? `Node ${vein.slot_index}`;

  return `Target ${codename}`;
}

function PanelSkeleton() {
  return (
    <div className="animate-pulse space-y-3 pt-5">
      <div className="h-3 w-28 rounded-full bg-surface-2/60" />
      <div className="h-8 w-44 rounded-2xl bg-surface-2/50" />
      <div className="h-4 w-full rounded-full bg-surface-2/45" />
      <div className="h-4 w-5/6 rounded-full bg-surface-2/45" />
      <div className="mt-6 flex flex-wrap gap-2">
        <div className="h-6 w-16 rounded-full bg-surface-2/45" />
        <div className="h-6 w-20 rounded-full bg-surface-2/45" />
        <div className="h-6 w-14 rounded-full bg-surface-2/45" />
      </div>
      <div className="h-24 rounded-2xl border border-line-steel/30 bg-surface-2/35" />
      <div className="h-11 rounded-lg bg-surface-2/45" />
      <div className="h-11 rounded-lg bg-surface-2/35" />
    </div>
  );
}

export function SelectedVeinPanel({
  vein,
  canMine,
  canReroll,
  isRerolling,
  isLoading,
  isError,
  errorMessage,
  warningMessage,
  onMine,
  onReroll,
}: SelectedVeinPanelProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  if (isLoading && !vein) {
    return (
      <aside className="observatory-panel observatory-frame flex h-full flex-col rounded-[28px] border border-line-steel/55 p-5 lg:sticky lg:top-6">
        <motion.div
          key="loading"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? undefined : { duration: 0.28, ease: "easeOut" }}
          className="h-full"
        >
          <PanelSkeleton />
        </motion.div>
      </aside>
    );
  }

  if (isError && !vein) {
    return (
      <aside className="observatory-panel observatory-frame flex h-full flex-col rounded-[28px] border border-line-steel/55 p-5 lg:sticky lg:top-6">
        <motion.div
          key="error"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? undefined : { duration: 0.28, ease: "easeOut" }}
          className="flex h-full flex-col justify-between"
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-cold-cyan/70">
              scan interrupted
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-text-primary">
              Target lost.
            </h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              {errorMessage ?? "The sector feed dropped before a target could be locked."}
            </p>
          </div>

          <div className="space-y-2 pt-6">
            <SignalButton
              type="button"
              variant="secondary"
              onClick={onReroll}
              disabled={!canReroll || isRerolling}
              className="w-full"
            >
              {isRerolling ? "RESCANNING" : "RESCAN SECTORS"}
            </SignalButton>
          </div>
        </motion.div>
      </aside>
    );
  }

  if (!vein) {
    return (
      <aside className="observatory-panel observatory-frame flex h-full flex-col rounded-[28px] border border-line-steel/55 p-5 lg:sticky lg:top-6">
        <motion.div
          key="empty"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? undefined : { duration: 0.28, ease: "easeOut" }}
          className="flex h-full flex-col justify-between"
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-cold-cyan/70">
              target analysis
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-text-primary">
              Awaiting lock.
            </h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              The scan shell is waiting for a vein to resolve.
            </p>
          </div>

          <div className="space-y-2 pt-6">
            <SignalButton
              type="button"
              variant="secondary"
              onClick={onReroll}
              disabled={!canReroll || isRerolling}
              className="w-full"
            >
              {isRerolling ? "RESCANNING" : "RESCAN SECTORS"}
            </SignalButton>
          </div>
        </motion.div>
      </aside>
    );
  }

  const rarity = RARITY_META[vein.rarity];
  const keywords = vein.keywords.slice(0, 4);
  const displayName = getVeinDisplayName(vein);
  const primaryKeyword = vein.keywords[0]?.ko ?? "signal";
  const secondaryKeyword = vein.keywords[1]?.ko;
  const instruction = secondaryKeyword
    ? `Use ${primaryKeyword} with ${secondaryKeyword} to open the next idea path.`
    : `Use this signal to open the next idea path.`;

  return (
    <aside className="observatory-panel observatory-frame flex h-full flex-col rounded-[28px] border border-line-steel/55 p-5 lg:sticky lg:top-6">
      <motion.div
        key={vein.id}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? undefined : { duration: 0.28, ease: "easeOut" }}
        className="flex h-full flex-col"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-cold-cyan/70">
              target analysis
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-text-primary">
              {displayName}
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {instruction}
            </p>
          </div>

          <span
            className={[
              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-text-secondary/80",
              rarity.panel,
            ].join(" ")}
          >
            <span className={["h-2 w-2 rounded-full", rarity.accent].join(" ")} />
            {rarity.label}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {keywords.map((keyword) => (
            <KeywordChip key={keyword.id} keyword={keyword} />
          ))}
        </div>

        {warningMessage && (
          <div className="mt-5 rounded-2xl border border-cold-cyan/20 bg-[rgba(92,205,229,0.08)] p-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-cold-cyan/70">
              scan warning
            </p>
            <p className="mt-2 text-sm leading-6 text-text-primary/90">
              {warningMessage}
            </p>
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-line-steel/40 bg-surface-1/50 p-4">
          <p className="text-[11px] uppercase tracking-[0.28em] text-text-secondary/70">
            scan note
          </p>
          <p className="mt-2 text-sm leading-6 text-text-primary/90">
            Open the target to route directly into the idea build.
          </p>
        </div>

        <div className="mt-auto space-y-2 pt-6">
          <SignalButton
            type="button"
            variant="primary"
            onClick={() => onMine(vein.id)}
            disabled={!canMine}
            className="w-full"
          >
            {canMine ? "MINE TARGET" : "MINE LOCKED"}
          </SignalButton>

          <SignalButton
            type="button"
            variant="secondary"
            onClick={onReroll}
            disabled={!canReroll || isRerolling}
            className="w-full"
          >
            {isRerolling ? "RESCANNING" : "RESCAN SECTORS"}
          </SignalButton>
        </div>
      </motion.div>
    </aside>
  );
}
