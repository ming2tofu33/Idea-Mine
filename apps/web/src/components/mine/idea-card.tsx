"use client";

import type { Idea, KeywordComboEntry } from "@/types/api";

// --- Tier config ---

const TIER_CONFIG: Record<
  string,
  { label: string; className: string } | null
> = {
  stable: null,
  expansion: {
    label: "확장",
    className:
      "bg-cold-cyan/10 text-cold-cyan border border-cold-cyan/30 text-xs font-medium px-2 py-0.5 rounded-full",
  },
  pivot: {
    label: "전환",
    className:
      "bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-medium px-2 py-0.5 rounded-full",
  },
  rare: {
    label: "희귀",
    className:
      "bg-violet-500/10 text-violet-400 border border-violet-500/30 text-xs font-medium px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.25)]",
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
      className="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium leading-4"
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
    <button
      type="button"
      onClick={() => !isVaulted && onToggle(idea.id)}
      disabled={isVaulted}
      className={[
        "w-full rounded-xl border p-5 text-left transition-all duration-200",
        "backdrop-blur-sm",
        isVaulted
          ? "cursor-default border-line-steel/20 bg-surface-1/50 opacity-60"
          : isSelected
            ? "border-signal-pink/40 bg-[rgba(255,59,147,0.06)]"
            : "border-line-steel/30 bg-surface-1/50 hover:border-line-steel/50",
      ].join(" ")}
    >
      {/* Top row: tier badge + checkbox */}
      <div className="mb-3 flex items-center justify-between">
        <div>{tier && <span className={tier.className}>{tier.label}</span>}</div>

        {isVaulted ? (
          <span className="text-xs font-medium text-text-secondary">
            반입 완료
          </span>
        ) : (
          <div
            className={[
              "flex h-5 w-5 items-center justify-center rounded border transition-colors",
              isSelected
                ? "border-signal-pink bg-signal-pink"
                : "border-line-steel",
            ].join(" ")}
          >
            {isSelected && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className="text-white"
              >
                <path
                  d="M2.5 6L5 8.5L9.5 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold text-text-primary">
        {idea.title_ko}
      </h3>

      {/* Summary */}
      <p className="mb-4 text-sm leading-relaxed text-text-secondary line-clamp-3">
        {idea.summary_ko}
      </p>

      {/* Keyword combo chips */}
      <div className="flex flex-wrap gap-1.5">
        {idea.keyword_combo.map((entry) => (
          <ComboChip key={entry.slug} entry={entry} />
        ))}
      </div>
    </button>
  );
}
