import type { Vein, VeinRarity } from "@/types/api";
import { KeywordChip } from "./keyword-chip";

interface VeinCardProps {
  vein: Vein;
  onMine: (veinId: string) => void;
  canMine: boolean;
  isMining: boolean;
}

const RARITY_CONFIG: Record<
  VeinRarity,
  { dotClass: string; label: string; borderClass: string }
> = {
  common: {
    dotClass: "bg-text-secondary",
    label: "일반 광맥",
    borderClass: "border-line-steel/40",
  },
  rare: {
    dotClass: "bg-[#8B5CF6]",
    label: "희귀 광맥",
    borderClass: "border-[#8B5CF6]/30",
  },
  golden: {
    dotClass: "bg-[#C4B07A]",
    label: "금빛 광맥",
    borderClass: "border-[#C4B07A]/30",
  },
  legend: {
    dotClass: "bg-white",
    label: "전설 광맥",
    borderClass: "border-white/20",
  },
};

export function VeinCard({ vein, onMine, canMine, isMining }: VeinCardProps) {
  const rarity = RARITY_CONFIG[vein.rarity];
  const disabled = !canMine || isMining;

  return (
    <div
      className={`rounded-xl bg-surface-1/60 p-5 backdrop-blur-sm border ${rarity.borderClass}`}
    >
      {/* Rarity badge */}
      <div className="mb-4 flex items-center gap-2">
        <span
          className={`inline-block h-2 w-2 rounded-full ${rarity.dotClass}`}
        />
        <span className="text-xs font-medium text-text-secondary">
          {rarity.label}
        </span>
      </div>

      {/* Keyword chips */}
      <div className="mb-5 flex flex-wrap gap-2">
        {vein.keywords.map((kw) => (
          <KeywordChip key={kw.id} keyword={kw} />
        ))}
      </div>

      {/* Mine button (Primary CTA) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onMine(vein.id)}
        className={[
          "w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200",
          disabled
            ? "cursor-not-allowed border-line-steel/30 bg-surface-2/40 text-text-secondary opacity-40"
            : "border-signal-pink/30 bg-[rgba(255,59,147,0.08)] text-text-primary hover:border-signal-pink/60 hover:shadow-[0_0_16px_rgba(255,59,147,0.2)]",
        ].join(" ")}
      >
        {isMining ? "채굴 중..." : "채굴하기 ⛏"}
      </button>
    </div>
  );
}
