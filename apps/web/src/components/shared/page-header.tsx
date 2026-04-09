"use client";

import type { ReactNode } from "react";

export type PageHeaderProps = {
  /** Eyebrow label, typically uppercase. e.g. "MINE" */
  eyebrow?: string;
  /** Main page title */
  title: string;
  /** Optional subtitle below the title */
  subtitle?: string;
  /** Right-side meta content (counters, badges, etc) */
  meta?: ReactNode;
  /** Optional className for outer wrapper */
  className?: string;
};

/**
 * Unified page header used across all (app) routes.
 * Provides consistent eyebrow + title + subtitle + meta layout.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  meta,
  className = "",
}: PageHeaderProps) {
  return (
    <header
      className={["flex flex-wrap items-end justify-between gap-4", className].join(
        " ",
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] uppercase tracking-[0.28em] text-cold-cyan/75">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-semibold text-text-primary sm:text-[26px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-sm leading-6 text-text-secondary">
            {subtitle}
          </p>
        )}
      </div>
      {meta && (
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">{meta}</div>
      )}
    </header>
  );
}
