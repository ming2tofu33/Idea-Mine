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
  landing: "min-h-12 rounded-xl py-2.5 sm:py-0",
  app: "min-h-11 rounded-lg py-2.5 sm:py-0",
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
        "grid items-start gap-2 sm:gap-3 lg:items-center",
        "grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
        VARIANT_STYLES[variant],
        className,
      ].join(" ")}
    >
      <div className="min-w-0 justify-self-start">{left}</div>
      <div className="min-w-0 justify-self-start lg:justify-self-center">
        {center}
      </div>
      <div className="min-w-0 justify-self-start lg:justify-self-end">
        {right}
      </div>
    </div>
  );
}
