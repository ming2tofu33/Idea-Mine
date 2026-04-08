"use client";

import type { Idea, KeywordComboEntry } from "@/types/api";
import { motion } from "framer-motion";

// --- Tier config ---

const TIER_CONFIG: Record<
  string,
  { label: string; className: string } | null
> = {
  stable: null,
  expansion: {
    label: "EXPANSION",
    className:
      "bg-cold-cyan/10 text-cold-cyan border border-cold-cyan/30 text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-sm shadow-[0_0_10px_rgba(92,205,229,0.2)]",
  },
  pivot: {
    label: "PIVOT",
    className:
      "bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-sm shadow-[0_0_10px_rgba(245,158,11,0.2)]",
  },
  rare: {
    label: "RARE",
    className:
      "bg-violet-500/10 text-violet-400 border border-violet-500/30 text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-sm shadow-[0_0_12px_rgba(139,92,246,0.4)]",
  },
};

// --- Combo chip colors (matching KeywordChip style) ---

const COMBO_COLORS: Record<string, string> = {
  ai: "#FF3B93",
  who: "#5CCDE5",
  domain: "#C4B07A",
  tech: "#4E9A6B",
  value: "#8B5CF6",
  money: "#FF7AAD",
};

function ComboChip({ entry }: { entry: KeywordComboEntry }) {
  const color = COMBO_COLORS[entry.category] ?? "#8B8FA3";

  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium leading-4 shadow-[inset_0px_1px_rgba(255,255,255,0.05)]"
      style={{
        color,
        backgroundColor: `${color}14`,
        border: `1px solid ${color}33`,
      }}
    >
      {entry.ko}
    </span>
  );
}

// --- IdeaCard ---

interface IdeaCardProps {
  idea: Idea;
  isSelected: boolean;
  onToggle: (ideaId: string) => void;
  isVaulted: boolean;
}

export function IdeaCard({ idea, isSelected, onToggle, isVaulted }: IdeaCardProps) {
  const tier = TIER_CONFIG[idea.tier_type];

  return (
    <motion.button
      type="button"
      whileHover={!isVaulted ? { y: -2, scale: 1.005 } : {}}
      whileTap={!isVaulted ? { scale: 0.99 } : {}}
      onClick={() => !isVaulted && onToggle(idea.id)}
      disabled={isVaulted}
      className={[
        "relative w-full rounded-xl p-5 text-left transition-all duration-300 outline-none overflow-hidden backdrop-blur-xl shadow-[inset_0px_1px_rgba(255,255,255,0.05),_0px_8px_20px_rgba(0,0,0,0.4)]",
        isVaulted
          ? "cursor-default border border-line-steel/20 border-t-line-steel/30 bg-surface-1/30 opacity-50"
          : isSelected
            ? "border border-signal-pink/40 border-t-signal-pink/70 bg-signal-pink/10 shadow-[inset_0px_1px_rgba(255,255,255,0.1),_0_0_20px_rgba(255,59,147,0.15)] ring-1 ring-signal-pink/20"
            : "border border-line-steel/20 border-t-line-steel/50 bg-surface-1/40 hover:border-cold-cyan/30 hover:bg-surface-1/60",
      ].join(" ")}
    >
      {/* Top row: tier badge + checkbox */}
      <div className="mb-3 flex items-center justify-between">
        <div>{tier && <span className={tier.className}>{tier.label}</span>}</div>

        {isVaulted ? (
          <span className="text-[10px] font-bold tracking-widest text-text-secondary/80">
            [ SECURED ]
          </span>
        ) : (
          <div
            className={[
              "flex h-5 w-5 items-center justify-center rounded-sm transition-all duration-300",
              isSelected
                ? "bg-signal-pink border border-t-white/40 shadow-[0_0_15px_rgba(255,59,147,0.5)]"
                : "border border-line-steel/50 bg-bg-base/80",
            ].join(" ")}
          >
            {isSelected && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className="text-white drop-shadow-md"
              >
                <path
                  d="M2.5 6L5 8.5L9.5 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-bold tracking-tight text-text-primary drop-shadow-sm">
        {idea.title_ko}
      </h3>

      {/* Summary */}
      <p className="mb-4 text-sm leading-relaxed text-text-secondary/90 line-clamp-3">
        {idea.summary_ko}
      </p>

      {/* Keyword combo chips */}
      <div className="flex flex-wrap gap-1.5">
        {idea.keyword_combo.map((entry) => (
          <ComboChip key={entry.slug} entry={entry} />
        ))}
      </div>
    </motion.button>
  );
}
