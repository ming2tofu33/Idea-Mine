"use client";

import type { ReactNode } from "react";

type StatusRailVariant = "landing" | "app";

export type StatusRailProps = {
  left: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  variant?: StatusRailVariant;
  className?: string;
};

const VARIANT_STYLES: Record<StatusRailVariant, string> = {
  landing: "h-12 rounded-xl",
  app: "h-11 rounded-lg",
};

export function StatusRail({
  left,
  center,
  right,
  variant = "app",
  className = "",
}: StatusRailProps) {
  return (
    <div
      className={[
        "observatory-panel observatory-frame relative z-20 w-full px-4 sm:px-5",
        "grid items-center gap-3",
        "grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
        VARIANT_STYLES[variant],
        className,
      ].join(" ")}
    >
      <div className="min-w-0 justify-self-start">{left}</div>
      <div className="min-w-0 justify-self-center">{center}</div>
      <div className="min-w-0 justify-self-end">{right}</div>
    </div>
  );
}
