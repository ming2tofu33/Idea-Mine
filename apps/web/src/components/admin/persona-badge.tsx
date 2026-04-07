"use client";

import type { UserProfile } from "@/types/api";

const PERSONA_CONFIG = {
  admin: { label: "ADM", color: "text-amber-400 border-amber-400/30 bg-amber-400/10" },
  free: { label: "FRE", color: "text-text-secondary border-line-steel/30 bg-surface-2/50" },
  lite: { label: "LIT", color: "text-cold-cyan border-cold-cyan/30 bg-cold-cyan/10" },
  pro: { label: "PRO", color: "text-signal-pink border-signal-pink/30 bg-signal-pink/10" },
} as const;

export function PersonaBadge({ profile }: { profile: UserProfile }) {
  if (profile.role !== "admin") return null;

  const key = profile.persona_tier ?? "admin";
  const config = PERSONA_CONFIG[key];

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider ${config.color}`}
    >
      {config.label}
    </span>
  );
}
