"use client";

import { motion } from "framer-motion";
import type { Vein, VeinRarity } from "@/types/api";
import { usePrefersReducedMotion } from "@/components/shared/use-prefers-reduced-motion";
import { Meteorite3D } from "./meteorite-3d";

type VeinSignalNodeProps = {
  vein: Vein;
  selected: boolean;
  onSelect: (id: string) => void;
  position: "top" | "left" | "right";
};

const POSITION_STYLES: Record<VeinSignalNodeProps["position"], string> = {
  top: "lg:left-1/2 lg:top-[10%] lg:-translate-x-1/2",
  left: "lg:left-[4%] lg:bottom-[14%]",
  right: "lg:right-[6%] lg:bottom-[8%]",
};

const POSITION_LABELS: Record<VeinSignalNodeProps["position"], string> = {
  top: "apex return",
  left: "lateral echo",
  right: "edge echo",
};

const RARITY_STYLES: Record<
  VeinRarity,
  { label: string; glow: string; rim: string; accent: string }
> = {
  common: {
    label: "Common",
    glow: "shadow-[0_0_26px_rgba(154,170,192,0.14)]",
    rim: "border-line-steel/45",
    accent: "bg-text-secondary",
  },
  rare: {
    label: "Rare",
    glow: "shadow-[0_0_30px_rgba(139,92,246,0.2)]",
    rim: "border-[#8B5CF6]/45",
    accent: "bg-[#8B5CF6]",
  },
  golden: {
    label: "Golden",
    glow: "shadow-[0_0_34px_rgba(196,176,122,0.22)]",
    rim: "border-[#C4B07A]/45",
    accent: "bg-[#C4B07A]",
  },
  legend: {
    label: "Legend",
    glow: "shadow-[0_0_38px_rgba(92,205,229,0.24)]",
    rim: "border-cold-cyan/45",
    accent: "bg-cold-cyan",
  },
};

export function VeinSignalNode({
  vein,
  selected,
  onSelect,
  position,
}: VeinSignalNodeProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const animateMotion = prefersReducedMotion === false;
  const rarity = RARITY_STYLES[vein.rarity];
  const primaryKeyword = vein.keywords[0]?.ko ?? "signal";
  const secondaryKeyword = vein.keywords[1]?.ko;

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(vein.id)}
      aria-pressed={selected}
      whileHover={animateMotion ? { y: -4, scale: selected ? 1.015 : 1.02 } : undefined}
      whileTap={animateMotion ? { scale: 0.98 } : undefined}
      animate={animateMotion ? { scale: selected ? 1.015 : 1 } : undefined}
      transition={
        animateMotion ? { type: "spring", stiffness: 320, damping: 24 } : undefined
      }
      className={[
        "group relative z-10 w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-cold-cyan/30 sm:max-w-[240px] lg:absolute lg:w-[min(270px,46vw)]",
        POSITION_STYLES[position],
      ].join(" ")}
    >
      <div
        className={[
          "relative overflow-hidden rounded-[28px] border bg-[linear-gradient(180deg,rgba(10,18,31,0.92)_0%,rgba(6,12,24,0.86)_100%)] p-3.5",
          "backdrop-blur-xl transition-all duration-300",
          selected
            ? [
                "border-cold-cyan/55",
                "shadow-[0_0_0_1px_rgba(92,205,229,0.18),0_0_28px_rgba(92,205,229,0.18)]",
              ].join(" ")
            : [
                rarity.rim,
                "shadow-[0_0_0_1px_rgba(42,60,88,0.42),0_18px_30px_rgba(0,0,0,0.24)]",
                rarity.glow,
              ].join(" "),
        ].join(" ")}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08)_0%,transparent_48%),radial-gradient(circle_at_50%_100%,rgba(92,205,229,0.08)_0%,transparent_48%)] opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.04)_50%,transparent_100%)]" />

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={[
                  "inline-flex h-2.5 w-2.5 shrink-0 rounded-full",
                  rarity.accent,
                  selected
                    ? "shadow-[0_0_12px_rgba(92,205,229,0.55)]"
                    : "shadow-[0_0_8px_rgba(255,255,255,0.08)]",
                ].join(" ")}
              />
              <span className="text-[10px] uppercase tracking-[0.3em] text-text-secondary/70">
                {POSITION_LABELS[position]}
              </span>
            </div>

            <h3 className="mt-2 truncate text-base font-semibold text-text-primary">
              {primaryKeyword}
            </h3>
            <p className="mt-1 max-h-10 overflow-hidden text-xs leading-5 text-text-secondary/80">
              {secondaryKeyword
                ? `${primaryKeyword} / ${secondaryKeyword}`
                : `Locked ${rarity.label.toLowerCase()} signal`}
            </p>
          </div>

          <span className="mt-1 rounded-full border border-line-steel/45 bg-surface-1/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-text-secondary/70">
            {rarity.label}
          </span>
        </div>

        <div className="relative mt-3 overflow-hidden rounded-[22px] border border-line-steel/40 bg-[radial-gradient(circle_at_50%_50%,rgba(92,205,229,0.12)_0%,rgba(6,12,24,0.1)_34%,rgba(6,12,24,0.82)_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,transparent_24%,transparent_76%,rgba(255,255,255,0.06)_100%)]" />
          <div className="absolute inset-0 opacity-90 mix-blend-screen">
            <Meteorite3D rarity={vein.rarity} />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(92,205,229,0.06)_50%,transparent_100%)]" />
          <div className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-inset ring-white/5" />
          <div className="absolute left-3 top-3 rounded-full border border-line-steel/40 bg-surface-1/65 px-2 py-1 text-[10px] uppercase tracking-[0.24em] text-text-secondary/80">
            {vein.keywords.length} signals
          </div>
        </div>

        <div className="relative mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-text-secondary/70">
          <span>detected target</span>
          <span>{selected ? "locked" : "available"}</span>
        </div>
      </div>

      <span
        className={[
          "pointer-events-none absolute inset-0 rounded-[28px] transition-opacity duration-300",
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          "bg-[radial-gradient(circle_at_50%_50%,rgba(92,205,229,0.2)_0%,transparent_62%)]",
        ].join(" ")}
      />
    </motion.button>
  );
}
