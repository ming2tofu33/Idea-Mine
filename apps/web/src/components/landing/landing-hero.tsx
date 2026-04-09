"use client";

import Link from "next/link";
import { signalButtonClassName } from "@/components/shared/signal-button-styles";
import { trackExperienceEvent } from "@/lib/experience-events";

export type LandingHeroProps = {
  hasUser: boolean;
};

export function LandingHero({ hasUser }: LandingHeroProps) {
  const primaryHref = "/mine";
  const primaryLabel = hasUser ? "Enter The Mine" : "Try today's vein";

  const handlePrimaryClick = () => {
    if (!hasUser) {
      trackExperienceEvent({
        eventName: "landing_experience_click",
        route: "/",
        metadata: { cta: "hero_primary" },
      });
    }
  };

  return (
    <section className="relative z-10 readable-container py-8 md:py-10 lg:py-14">
      <div className="grid gap-6 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:grid-cols-[45fr_55fr] lg:items-stretch lg:gap-8">
        <div className="observatory-panel observatory-frame flex flex-col justify-between rounded-2xl p-5 sm:p-8 lg:p-9">
          <div className="space-y-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-cold-cyan/85">
              Idea Exploration Platform
            </p>
            <h1 className="max-w-[14ch] text-4xl font-semibold leading-[1.05] tracking-tight text-text-primary sm:text-5xl">
              Discover high-value ideas like deep space signals.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base">
              IDEA MINE helps teams explore, select, and evolve ideas into real
              planning assets. Mine for promising signals, store validated
              outcomes, and refine them into execution-ready directions.
            </p>
            {!hasUser && (
              <p className="max-w-xl text-xs leading-5 text-text-secondary/70">
                로그인 없이 오늘의 광맥을 먼저 체험할 수 있어요. 저장과 전체 탐색은 로그인 후에 열립니다.
              </p>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={primaryHref}
                onClick={handlePrimaryClick}
                className={signalButtonClassName({
                  variant: "primary",
                  className: "px-5 py-2.5 text-sm",
                })}
              >
                {primaryLabel}
              </Link>
              <a
                href="#product-proof"
                className={signalButtonClassName({
                  variant: "secondary",
                  className: "px-5 py-2.5 text-sm",
                })}
              >
                View Product Preview
              </a>
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-text-secondary/75">
              Discover - Curate - Expand
            </p>
          </div>
        </div>

        <div className="observatory-panel observatory-frame rounded-2xl p-4 sm:p-5 lg:p-6">
          <div className="observatory-frame rounded-xl border border-line-steel/40 bg-surface-1/55 p-4 sm:p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-text-secondary/70">
                  Mine / Sector Scan
                </p>
                <p className="mt-1 text-sm text-text-primary">
                  Three active veins detected
                </p>
              </div>
              <span className="rounded-full border border-cold-cyan/35 bg-cold-cyan/10 px-2.5 py-1 text-[11px] text-cold-cyan">
                Stability 92%
              </span>
            </div>

            <div className="relative min-h-[260px] overflow-hidden rounded-xl border border-line-steel/35 bg-bg-base/80 sm:min-h-[320px] lg:min-h-[420px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(92,205,229,0.12),transparent_35%),radial-gradient(circle_at_78%_72%,rgba(255,59,147,0.16),transparent_40%)]" />
              <div className="absolute inset-0 opacity-30 [background:linear-gradient(rgba(42,60,88,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(42,60,88,0.55)_1px,transparent_1px)] [background-size:28px_28px]" />

              <div className="absolute left-[18%] top-[64%] h-20 w-20 rounded-full border border-line-steel/50 bg-surface-2/45 shadow-[0_0_20px_rgba(92,205,229,0.2)]" />
              <div className="absolute left-[49%] top-[21%] h-24 w-24 rounded-full border border-signal-pink/45 bg-surface-2/45 shadow-[0_0_24px_rgba(255,59,147,0.28)]" />
              <div className="absolute left-[73%] top-[50%] h-16 w-16 rounded-full border border-line-steel/50 bg-surface-2/45 shadow-[0_0_18px_rgba(92,205,229,0.16)]" />

              <div className="absolute bottom-0 left-0 right-0 border-t border-line-steel/35 bg-bg-deep/80 p-3 text-xs text-text-secondary">
                Selected Vein: <span className="text-text-primary">Neon Relay Cluster</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
