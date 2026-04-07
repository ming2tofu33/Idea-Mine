"use client";

import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, children, className }: SectionCardProps) {
  return (
    <div
      className={[
        "rounded-xl border border-line-steel/20 bg-surface-1/50 p-5 backdrop-blur-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-cold-cyan/70">
        {title}
      </h4>
      {children}
    </div>
  );
}
