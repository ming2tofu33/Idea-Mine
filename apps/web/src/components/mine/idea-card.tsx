"use client";

import type { Idea, KeywordComboEntry } from "@/types/api";
import { motion } from "framer-motion";

// --- Combo chip colors (aligned with the quieter keyword tag treatment) ---

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
      className="inline-flex items-center gap-1.5 rounded-full border border-line-steel/45 bg-[linear-gradient(180deg,rgba(10,16,26,0.96)_0%,rgba(6,11,19,0.92)_100%)] px-2 py-0.5 text-[10px] font-medium leading-4 tracking-[0.16em] text-text-secondary"
      style={{
        boxShadow:
          `inset 0px 1px rgba(255,255,255,0.04), 0px 1px 0px rgba(0,0,0,0.32), inset 2px 0px 0px ${color}30`,
      }}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 0 10px ${color}22`,
        }}
      />
      {entry.label}
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
  const ideaLine = idea.idea_line || idea.summary;

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
      {/* Top row: status + checkbox */}
      <div className="mb-3 flex items-center justify-end">
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
        {idea.title}
      </h3>

      {/* One-line idea */}
      <p className="mb-2 text-sm font-medium leading-relaxed text-text-primary/95 line-clamp-2">
        {ideaLine}
      </p>

      {/* Summary */}
      <p className="mb-4 text-xs leading-relaxed text-text-secondary/80 line-clamp-2">
        {idea.summary}
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
