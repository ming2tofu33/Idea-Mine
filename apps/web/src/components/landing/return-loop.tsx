"use client";

import {
  LANDING_LABELS,
  type LandingLanguage,
} from "@/components/landing/landing-labels";

function ReturnBeat({
  title,
  copy,
}: {
  title: string;
  copy: string;
}) {
  return (
    <article className="border-t border-line-steel/14 pt-2.5 sm:border-t-0 sm:border-l sm:border-line-steel/14 sm:pl-4 sm:pt-0 first:sm:border-l-0 first:sm:pl-0">
      <p className="text-[10px] font-medium tracking-[0.12em] text-text-secondary/56 sm:text-[11px]">
        {title}
      </p>
      <p className="mt-1 max-w-[22ch] text-[12px] leading-5.5 text-pretty text-text-primary sm:text-[13px] sm:leading-6">
        {copy}
      </p>
    </article>
  );
}

export function ReturnLoop({ lang }: { lang: LandingLanguage }) {
  const labels = LANDING_LABELS.returnLoop;

  return (
    <section
      id="return-loop"
      aria-label="Return loop"
      className="relative z-10 readable-container py-2 md:py-3"
    >
      <div className="border-t border-line-steel/16 pt-3.5 sm:pt-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.28fr)] lg:items-start lg:gap-7">
          <div className="space-y-1.5">
            <h2 className="max-w-[13ch] text-[1.25rem] font-semibold leading-[1] tracking-[-0.03em] text-balance text-text-primary sm:text-[1.45rem]">
              {labels.title[lang]}
            </h2>
            <p className="max-w-[24rem] text-[12px] leading-5.5 text-pretty text-text-secondary sm:text-[13px] sm:leading-6">
              {labels.copy[lang]}
            </p>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3 sm:gap-3 lg:border-l lg:border-line-steel/16 lg:pl-7">
            {labels.beats.map((beat) => (
              <ReturnBeat
                key={beat.title.en}
                title={beat.title[lang]}
                copy={beat.copy[lang]}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
