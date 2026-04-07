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
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 text-text-secondary/30">{icon}</div>
      <p className="text-sm font-medium text-text-secondary">{title}</p>
      <p className="mt-1 text-xs text-text-secondary/60">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
