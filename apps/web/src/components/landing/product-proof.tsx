"use client";

import {
  LANDING_LABELS,
  type LandingLanguage,
} from "@/components/landing/landing-labels";

function FlowStep({
  id,
  title,
  copy,
  outcome,
}: {
  id: string;
  title: string;
  copy: string;
  outcome: string;
}) {
  return (
    <article className="grid gap-3 border-t border-line-steel/16 py-3.5 first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start sm:gap-4">
      <span className="w-fit font-mono text-[10px] tracking-[0.16em] text-cold-cyan/72 sm:text-[11px]">
        {id}
      </span>
      <div className="space-y-1.5">
        <h3 className="text-[1rem] font-medium tracking-[-0.02em] text-text-primary sm:text-[1.08rem]">
          {title}
        </h3>
        <p className="max-w-[32rem] text-[13px] leading-6 text-pretty text-text-secondary sm:text-sm">
          {copy}
        </p>
      </div>
      <span className="w-fit rounded-full border border-line-steel/22 bg-surface-1/42 px-2.5 py-1 text-[10px] font-medium tracking-[0.06em] text-text-secondary sm:justify-self-end">
        {outcome}
      </span>
    </article>
  );
}

function DocumentsRail({
  label,
  docs,
}: {
  label: string;
  docs: string[];
}) {
  const [leadDoc, ...secondaryDocs] = docs;

  return (
    <div className="border-t border-line-steel/16 pt-4">
      <p className="text-[10px] font-medium tracking-[0.12em] text-text-secondary/56 sm:text-[11px]">
        {label}
      </p>
      <div className="mt-3 space-y-3">
        <div className="border-l border-cold-cyan/24 pl-3">
          <p className="font-mono text-[10px] tracking-[0.14em] text-cold-cyan/68 sm:text-[11px]">
            01
          </p>
          <p className="mt-1.5 text-[1rem] font-medium tracking-[-0.02em] text-text-primary sm:text-[1.08rem]">
            {leadDoc}
          </p>
        </div>

        <div className="space-y-1.5">
          {secondaryDocs.map((doc, index) => (
          <div
            key={doc}
            className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-t border-line-steel/14 py-2 first:border-t-0 first:pt-0 last:pb-0"
          >
            <span className="font-mono text-[10px] tracking-[0.14em] text-text-secondary/46 sm:text-[11px]">
              0{index + 2}
            </span>
            <span className="text-[13px] text-text-primary sm:text-sm">{doc}</span>
          </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductProof({ lang }: { lang: LandingLanguage }) {
  const labels = LANDING_LABELS.flow;

  return (
    <section
      id="idea-flow"
      aria-label="Idea to document flow"
      className="relative z-10 readable-container py-3 md:py-4"
    >
      <div className="border-t border-line-steel/16 pt-3.5 sm:pt-4">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.18fr)_minmax(15rem,0.82fr)] lg:gap-7">
          <div>
            <div className="space-y-2">
              <h2 className="max-w-[13ch] text-[1.55rem] font-semibold leading-[0.98] tracking-[-0.03em] text-balance text-text-primary sm:text-[1.78rem]">
                {labels.title[lang]}
              </h2>
              <p className="max-w-[28rem] text-[12px] leading-5.5 text-pretty text-text-secondary sm:text-[13px] sm:leading-6">
                {labels.copy[lang]}
              </p>
            </div>

            <div className="mt-4 border-t border-line-steel/16 pt-3 sm:mt-5 sm:pt-3.5">
              {labels.steps.map((step) => (
                <FlowStep
                  key={step.id}
                  id={step.id}
                  title={step.title[lang]}
                  copy={step.copy[lang]}
                  outcome={step.outcome[lang]}
                />
              ))}
            </div>
          </div>

          <aside className="border-t border-line-steel/16 pt-4 lg:border-t-0 lg:border-l lg:pl-7 lg:pt-0">
            <div className="space-y-1.5">
              <p className="text-[10px] font-medium tracking-[0.12em] text-text-secondary/56 sm:text-[11px]">
                {labels.selectedIdeaLabel[lang]}
              </p>
              <h3 className="max-w-[15rem] text-[1.1rem] font-medium leading-[1.24] tracking-[-0.025em] text-balance text-text-primary sm:text-[1.22rem]">
                {labels.selectedIdeaTitle[lang]}
              </h3>
            </div>

            <DocumentsRail label={labels.docsLabel[lang]} docs={labels.docs[lang]} />
          </aside>
        </div>
      </div>
    </section>
  );
}
