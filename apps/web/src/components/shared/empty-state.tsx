"use client";

import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-line-steel/40 bg-surface-1/10 backdrop-blur-md shadow-[inset_0px_1px_rgba(255,255,255,0.02)]">
      <div className="mb-6 text-line-steel/50 drop-shadow-md transition-all duration-300 hover:text-cold-cyan/50 hover:drop-shadow-[0_0_15px_rgba(92,205,229,0.3)]">
        {icon}
      </div>
      <p className="text-[11px] font-bold tracking-widest text-text-secondary/80">
        [ {title.toUpperCase()} ]
      </p>
      <p className="mt-2 text-xs leading-relaxed text-text-secondary/50 max-w-sm">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
