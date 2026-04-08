import type { Vein, VeinRarity } from "@/types/api";
import { KeywordChip } from "./keyword-chip";
import { motion } from "framer-motion";
import { Meteorite3D } from "./meteorite-3d";

interface VeinCardProps {
  vein: Vein;
  onMine: (veinId: string) => void;
  canMine: boolean;
  isMining: boolean;
}

const RARITY_CONFIG: Record<
  VeinRarity,
  { dotClass: string; label: string; glow: string }
> = {
  common: {
    dotClass: "bg-text-secondary",
    label: "일반 광맥",
    glow: "shadow-[0_0_8px_rgba(154,170,192,0.5)]",
  },
  rare: {
    dotClass: "bg-[#8B5CF6]",
    label: "희귀 광맥",
    glow: "shadow-[0_0_10px_rgba(139,92,246,0.6)]",
  },
  golden: {
    dotClass: "bg-[#C4B07A]",
    label: "금빛 광맥",
    glow: "shadow-[0_0_12px_rgba(196,176,122,0.6)]",
  },
  legend: {
    dotClass: "bg-white",
    label: "전설 광맥",
    glow: "shadow-[0_0_15px_rgba(255,255,255,0.8)]",
  },
};

export function VeinCard({ vein, onMine, canMine, isMining }: VeinCardProps) {
  const rarity = RARITY_CONFIG[vein.rarity];
  const disabled = !canMine || isMining;

  return (
    <motion.div
      whileHover={!disabled ? { y: -2 } : {}}
      className="flex flex-col relative overflow-hidden rounded-xl bg-surface-1/40 backdrop-blur-xl border border-line-steel/20 border-t-line-steel/50 shadow-[inset_0px_1px_rgba(255,255,255,0.05),_0px_8px_20px_rgba(0,0,0,0.4)] h-full"
    >
      {/* Top Half: 3D Meteorite Display (Clean stage) */}
      <div className="relative h-48 w-full bg-gradient-to-b from-black/0 to-bg-deep/30">
        <div className="absolute inset-0 z-0 mix-blend-screen overflow-visible">
          <Meteorite3D rarity={vein.rarity} />
        </div>

        {/* Floating Rarity Badge in the display area */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full border border-line-steel/30 bg-surface-1/50 px-2 py-1 backdrop-blur-md">
          <span
            className={`inline-block h-2 w-2 rounded-full ${rarity.dotClass} ${rarity.glow}`}
          />
          <span className="text-[10px] font-semibold tracking-wider text-text-secondary drop-shadow-md">
            [{rarity.label}]
          </span>
        </div>
      </div>

      {/* Bottom Half: Interactive Card UI */}
      <div className="relative z-10 p-5 flex flex-col flex-1 justify-end bg-surface-1/60 border-t border-line-steel/10">
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
            "relative w-full rounded-lg px-4 py-3 text-sm font-semibold tracking-wide transition-all duration-300 backdrop-blur-md",
            disabled
              ? "cursor-not-allowed border border-line-steel/30 bg-surface-2/40 text-text-secondary opacity-40 shadow-none"
              : "border border-t-white/20 border-x-white/5 border-b-black/50 bg-signal-pink/80 text-white hover:bg-signal-pink hover:shadow-[0_0_20px_rgba(255,59,147,0.4)] active:translate-y-[1px] active:scale-[0.98] active:shadow-none",
          ].join(" ")}
        >
          {isMining ? "[ PROCESSING... ]" : "[ 채굴 시스템 가동 ]"}
        </button>
      </div>
    </motion.div>
  );
}
