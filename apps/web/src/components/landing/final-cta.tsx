"use client";

import Link from "next/link";
import {
  LANDING_LABELS,
  type LandingLanguage,
} from "@/components/landing/landing-labels";
import { signalButtonClassName } from "@/components/shared/signal-button-styles";
import { trackExperienceEvent } from "@/lib/experience-events";

export function FinalCta({
  hasUser,
  lang,
}: {
  hasUser: boolean;
  lang: LandingLanguage;
}) {
  const primaryHref = "/mine";
  const primaryLabel = hasUser
    ? LANDING_LABELS.finalCta.primaryCta.member[lang]
    : LANDING_LABELS.finalCta.primaryCta.guest[lang];

  const handlePrimaryClick = () => {
    if (!hasUser) {
      trackExperienceEvent({
        eventName: "landing_experience_click",
        route: "/",
        metadata: { cta: "final_cta" },
      });
    }
  };

  return (
    <section
      id="final-cta"
      aria-label="Final call to action"
      className="relative z-10 readable-container py-3 pb-10 md:py-4 md:pb-14"
    >
      <div className="border-t border-line-steel/16 pt-4 sm:pt-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="max-w-[12ch] text-[1.5rem] font-semibold leading-[1] tracking-[-0.03em] text-balance text-text-primary sm:text-[1.8rem]">
              {LANDING_LABELS.finalCta.title[lang]}
            </h2>
          </div>

          <Link
            href={primaryHref}
            onClick={handlePrimaryClick}
            className={signalButtonClassName({
              variant: "primary",
              className:
                "min-h-11 w-full px-5 py-2.5 text-[13px] sm:min-h-12 sm:w-fit sm:px-6 sm:py-3 sm:text-sm",
            })}
          >
            {primaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
