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
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium leading-5"
      style={{
        color,
        backgroundColor: `${color}14`, // 8% opacity
        border: `1px solid ${color}33`, // 20% opacity
      }}
    >
      {keyword.ko}
    </span>
  );
}
