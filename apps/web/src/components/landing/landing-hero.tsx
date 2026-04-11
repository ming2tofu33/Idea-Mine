"use client";

import Link from "next/link";
import {
  LANDING_LABELS,
  type LandingLanguage,
} from "@/components/landing/landing-labels";
import { signalButtonClassName } from "@/components/shared/signal-button-styles";
import { trackExperienceEvent } from "@/lib/experience-events";

export type LandingHeroProps = {
  hasUser: boolean;
  lang: LandingLanguage;
};

function SignalWorkbenchRow({
  title,
  detail,
  status,
  active,
}: {
  title: string;
  detail: string;
  status: string;
  active: boolean;
}) {
  return (
    <div
      className={[
        "border-t border-line-steel/14 px-4 py-3 first:border-t-0 sm:px-5",
        active ? "bg-signal-pink/[0.035]" : "bg-transparent",
      ].join(" ")}
    >
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={[
              "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border",
              active
                ? "border-signal-pink/30 bg-signal-pink shadow-[0_0_8px_rgba(255,59,147,0.2)]"
                : "border-line-steel/40 bg-surface-2/60",
            ].join(" ")}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">{title}</p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">{detail}</p>
          </div>
        </div>

        <span
          className={[
            "inline-flex w-fit rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-[0.06em]",
            active
              ? "border-signal-pink/18 bg-signal-pink/8 text-signal-pink"
              : "border-line-steel/22 bg-surface-1/55 text-text-secondary",
          ].join(" ")}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

export function LandingHero({ hasUser, lang }: LandingHeroProps) {
  const primaryHref = "/mine";
  const primaryLabel = hasUser
    ? LANDING_LABELS.hero.primaryCta.member[lang]
    : LANDING_LABELS.hero.primaryCta.guest[lang];
  const heroSignals = LANDING_LABELS.hero.preview.signals.slice(0, 2);
  const nextDocs = LANDING_LABELS.flow.docs[lang].slice(0, 3);

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
    <section className="relative z-10 readable-container py-8 md:py-12 lg:py-16">
      <div className="grid gap-8 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:grid-cols-[46fr_54fr] lg:items-stretch lg:gap-10">
        <div className="flex flex-col justify-between border-t border-line-steel/18 pt-6 sm:pt-8 lg:min-h-[36rem] lg:pt-12">
          <div className="space-y-6 sm:space-y-7">
            <div className="flex items-center gap-3 text-[10px] font-medium tracking-[0.12em] text-text-secondary/56 sm:text-[11px]">
              <span className="h-px w-10 bg-line-steel/55" />
              <span>{LANDING_LABELS.hero.preview.pathLabel[lang]}</span>
            </div>
            <h1 className="max-w-[10.6ch] text-[clamp(2.9rem,14vw,4.6rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-balance text-text-primary sm:max-w-[8.9ch] sm:text-[clamp(3.8rem,9.2vw,5.7rem)] sm:leading-[0.87] lg:max-w-[9.15ch] lg:text-[clamp(4.5rem,8.3vw,6.15rem)] lg:leading-[0.85]">
              {LANDING_LABELS.hero.headline[lang]}
            </h1>
            <p className="max-w-[24rem] text-[14px] leading-6.5 text-pretty text-text-secondary sm:max-w-[26rem] sm:text-[15px] sm:leading-7">
              {LANDING_LABELS.hero.support[lang]}
            </p>
          </div>

          <div className="mt-10 border-t border-line-steel/14 pt-5 sm:mt-11 sm:pt-6">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <Link
                href={primaryHref}
                onClick={handlePrimaryClick}
                className={signalButtonClassName({
                  variant: "primary",
                  className:
                    "min-h-11 w-full px-4.5 py-2.5 text-[13px] shadow-[0_8px_20px_rgba(0,0,0,0.26)] sm:min-h-12 sm:w-auto sm:px-5 sm:text-sm",
                })}
              >
                {primaryLabel}
              </Link>
              <a
                href="#idea-flow"
                className={signalButtonClassName({
                  variant: "secondary",
                  className:
                    "min-h-11 w-full px-4.5 py-2.5 text-[13px] sm:min-h-12 sm:w-auto sm:px-5 sm:text-sm",
                })}
              >
                {LANDING_LABELS.hero.secondaryCta[lang]}
              </a>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden border-y border-line-steel/18">
          <div className="border-b border-line-steel/18 px-4 py-3.5 sm:px-5 sm:py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary/62 sm:text-[11px]">
                  {LANDING_LABELS.hero.preview.shell[lang]}
                </p>
                <p className="mt-2 max-w-[18rem] text-sm font-medium leading-6 text-pretty text-text-primary">
                  {LANDING_LABELS.hero.preview.title[lang]}
                </p>
              </div>
              <span className="rounded-full border border-cold-cyan/24 bg-cold-cyan/8 px-2.5 py-1 text-[11px] text-cold-cyan">
                {LANDING_LABELS.hero.preview.readyCount[lang]}
              </span>
            </div>
          </div>

          <div className="relative min-h-[220px] overflow-hidden bg-bg-base/88 sm:min-h-[280px] lg:min-h-[360px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(92,205,229,0.04),transparent_30%),radial-gradient(circle_at_82%_28%,rgba(255,59,147,0.05),transparent_34%)]" />
            <div className="absolute inset-0 opacity-[0.08] [background:linear-gradient(rgba(24,35,52,0.42)_1px,transparent_1px),linear-gradient(90deg,rgba(24,35,52,0.42)_1px,transparent_1px)] [background-size:30px_30px]" />

            <div className="relative grid min-h-[220px] sm:min-h-[280px] lg:min-h-[360px] lg:grid-cols-[minmax(12rem,0.62fr)_minmax(0,1.38fr)]">
              <aside className="hidden border-b border-line-steel/18 bg-bg-deep/26 lg:block lg:border-b-0 lg:border-r">
                <div className="border-b border-line-steel/14 px-4 py-3 sm:px-5">
                  <p className="text-[10px] font-medium tracking-[0.08em] text-text-secondary/58 sm:text-[11px]">
                    {LANDING_LABELS.hero.preview.selectedSignal[lang]}
                  </p>
                </div>

                <div>
                  {heroSignals.map((item, index) => (
                    <SignalWorkbenchRow
                      key={item.title.en}
                      title={item.title[lang]}
                      detail={item.detail[lang]}
                      status={
                        index === 0 ? item.status.active[lang] : item.status.inactive[lang]
                      }
                      active={index === 0}
                    />
                  ))}
                </div>
              </aside>

              <div className="flex min-h-[176px] flex-col">
                <div className="border-b border-line-steel/18 px-4 py-4 sm:px-5 sm:py-4.5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-medium tracking-[0.08em] text-text-secondary/58 sm:text-[11px]">
                        {LANDING_LABELS.hero.preview.selectedSignal[lang]}
                      </p>
                      <p className="mt-2 max-w-[15rem] text-[1.16rem] font-medium leading-[1.24] tracking-[-0.03em] text-pretty text-text-primary sm:max-w-[18rem] sm:text-[1.34rem] lg:text-[1.42rem]">
                        {LANDING_LABELS.hero.preview.selectedTitle[lang]}
                      </p>
                    </div>
                    <span className="rounded-full border border-cold-cyan/20 bg-cold-cyan/8 px-2.5 py-1 text-[10px] font-medium tracking-[0.06em] text-cold-cyan">
                      {LANDING_LABELS.hero.preview.ready[lang]}
                    </span>
                  </div>
                </div>

                <div className="grid flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(11rem,0.9fr)]">
                  <div className="flex flex-col px-4 py-4 sm:px-5 sm:py-4.5">
                    <p className="text-[10px] font-medium tracking-[0.08em] text-text-secondary/58 sm:text-[11px]">
                      {LANDING_LABELS.hero.preview.whyTitle[lang]}
                    </p>
                    <p className="mt-3 max-w-[30ch] text-[13px] leading-6 text-pretty text-text-primary sm:text-sm">
                      {LANDING_LABELS.hero.preview.whyBody[lang]}
                    </p>

                    <div className="mt-4 lg:mt-auto lg:pt-5">
                      <div className="flex items-center gap-3 border-t border-line-steel/16 pt-4">
                        <span className="h-px flex-1 bg-gradient-to-r from-cold-cyan/20 to-transparent" />
                        <span className="font-mono text-[10px] tracking-[0.12em] text-text-secondary/50 sm:text-[11px]">
                          {LANDING_LABELS.hero.preview.pathLabel[lang]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-line-steel/16 px-4 py-4 sm:px-5 sm:py-4.5 lg:border-l lg:border-t-0">
                    <p className="text-[10px] font-medium tracking-[0.08em] text-text-secondary/58 sm:text-[11px]">
                      {LANDING_LABELS.hero.preview.nextTitle[lang]}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {nextDocs.map((doc) => (
                        <span
                          key={doc}
                          className="rounded-full border border-line-steel/20 bg-surface-1/42 px-2.5 py-1 text-[11px] leading-5 text-text-primary"
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cold-cyan/14 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-signal-pink/14 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
