"use client";

import { Lock } from "lucide-react";

interface LockedItemProps {
  number: number;
  title: string;
  description: string;
  requiredTier: "lite" | "pro";
}

export function LockedItem({
  number,
  title,
  description,
  requiredTier,
}: LockedItemProps) {
  const tierLabel = requiredTier === "lite" ? "Lite" : "Pro";

  return (
    <div className="rounded-xl border border-dashed border-line-steel/20 bg-surface-1/15 p-5">
      <div className="flex items-center gap-3">
        {/* Number */}
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2/40 text-xs font-bold text-text-secondary/40">
          {number}
        </span>

        {/* Title + lock */}
        <div className="flex flex-1 items-center gap-2">
          <Lock className="h-4 w-4 text-text-secondary/40" />
          <span className="text-sm font-medium text-text-secondary/50">
            {title}
          </span>
        </div>
      </div>

      {/* Blurred description */}
      <p className="mt-3 select-none text-sm leading-relaxed text-text-secondary/40 blur-[2px]">
        {description}
      </p>

      {/* CTA */}
      <button
        type="button"
        className="mt-4 cursor-pointer rounded-lg border border-signal-pink/30 bg-signal-pink/5 px-4 py-2 text-xs font-medium text-signal-pink transition-all duration-200 hover:bg-signal-pink/10"
      >
        {tierLabel}에서 해금
      </button>
    </div>
  );
}
