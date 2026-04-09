"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

export type SoftGatePanelProps = {
  title: string;
  body: string;
  ctaLabel: string;
  next: string;
  secondaryLabel?: string;
  onImpression?: () => void;
  onCtaClick?: () => void;
};

export function SoftGatePanel({
  title,
  body,
  ctaLabel,
  next,
  secondaryLabel,
  onImpression,
  onCtaClick,
}: SoftGatePanelProps) {
  // Fire impression on render (once)
  if (typeof window !== "undefined" && onImpression) {
    // Defer to next tick so analytics don't run during React render
    setTimeout(onImpression, 0);
  }

  const signInHref = `/auth/sign-in?next=${encodeURIComponent(next)}`;

  return (
    <div className="rounded-2xl border border-cold-cyan/20 bg-[rgba(92,205,229,0.06)] p-5 backdrop-blur-md">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cold-cyan/30 bg-cold-cyan/10">
          <Lock className="h-4 w-4 text-cold-cyan" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary sm:text-base">
            {title}
          </h3>
          <p className="mt-1.5 text-xs leading-5 text-text-secondary sm:text-sm">
            {body}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Link
          href={signInHref}
          onClick={onCtaClick}
          className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-cold-cyan/40 bg-cold-cyan/15 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all duration-200 hover:bg-cold-cyan/25 hover:shadow-[0_0_20px_rgba(92,205,229,0.15)]"
        >
          {ctaLabel}
        </Link>
        {secondaryLabel && (
          <span className="text-xs text-text-secondary/60 sm:ml-2">
            {secondaryLabel}
          </span>
        )}
      </div>
    </div>
  );
}
