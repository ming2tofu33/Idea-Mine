import type { Keyword } from "@/types/api";

const CATEGORY_COLORS: Record<Keyword["category"], string> = {
  ai: "#FF3B93",
  who: "#5CCDE5",
  domain: "#C4B07A",
  tech: "#4E9A6B",
  value: "#8B5CF6",
  money: "#FF7AAD",
};

export function KeywordChip({ keyword }: { keyword: Keyword }) {
  const color = CATEGORY_COLORS[keyword.category];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-line-steel/45 bg-[linear-gradient(180deg,rgba(10,16,26,0.96)_0%,rgba(6,11,19,0.92)_100%)] px-2.5 py-1 text-[10px] font-medium leading-4 tracking-[0.18em] text-text-secondary"
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
      {keyword.ko}
    </span>
  );
}
