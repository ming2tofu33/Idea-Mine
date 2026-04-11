"use client";

import {
  LANDING_LABELS,
  type LandingLanguage,
} from "@/components/landing/landing-labels";

function ReasonColumn({
  index,
  title,
  copy,
}: {
  index: string;
  title: string;
  copy: string;
}) {
  return (
    <article className="border-t border-line-steel/16 pt-2.5 sm:pt-3 lg:border-t-0 lg:border-l lg:pl-5 lg:pt-0 first:lg:border-l-0 first:lg:pl-0">
      <p className="font-mono text-[10px] tracking-[0.16em] text-cold-cyan/74 sm:text-[11px]">
        {index}
      </p>
      <h3 className="mt-1.5 text-[0.96rem] font-medium tracking-[-0.02em] text-text-primary sm:text-[1rem]">
        {title}
      </h3>
      <p className="mt-1.5 max-w-[24ch] text-[12px] leading-5.5 text-pretty text-text-secondary sm:text-[13px] sm:leading-6">
        {copy}
      </p>
    </article>
  );
}

export function CoreLoopPreview({ lang }: { lang: LandingLanguage }) {
  const labels = LANDING_LABELS.whyToday;

  return (
    <section
      id="why-today"
      aria-label="Why look today"
      className="relative z-10 readable-container py-2 md:py-3"
    >
      <div className="border-t border-line-steel/16 pt-3.5 sm:pt-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.28fr)] lg:gap-7">
          <div className="space-y-2">
            <h2 className="max-w-[11ch] text-[1.35rem] font-semibold leading-[0.98] tracking-[-0.03em] text-balance text-text-primary sm:text-[1.55rem]">
              {labels.title[lang]}
            </h2>
            <p className="max-w-[24rem] text-[12px] leading-5.5 text-pretty text-text-secondary sm:text-[13px] sm:leading-6">
              {labels.copy[lang]}
            </p>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3 sm:gap-3 lg:border-l lg:border-line-steel/16 lg:pl-7">
            {labels.reasons.map((reason) => (
              <ReasonColumn
                key={reason.index}
                index={reason.index}
                title={reason.title[lang]}
                copy={reason.copy[lang]}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
