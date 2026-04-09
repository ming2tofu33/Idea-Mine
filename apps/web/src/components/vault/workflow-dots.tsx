"use client";

import { VAULT_LABELS, type VaultLanguage } from "./vault-labels";

/**
 * Vault idea card의 하단 진행률 표시.
 * 원석 → 개요 → 감정 → 풀 개요 4단계 dot.
 */
export function WorkflowDots({
  hasOverview,
  lang,
}: {
  hasOverview: boolean;
  lang: VaultLanguage;
}) {
  const current = hasOverview ? 1 : 0;
  const steps = [
    VAULT_LABELS.workflow.raw[lang],
    VAULT_LABELS.workflow.overview[lang],
    VAULT_LABELS.workflow.appraisal[lang],
    VAULT_LABELS.workflow.fullOverview[lang],
  ];

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-1">
          {i > 0 && (
            <div
              className={[
                "h-px w-2",
                i <= current ? "bg-cold-cyan/40" : "bg-line-steel/30",
              ].join(" ")}
            />
          )}
          <div
            title={step}
            className={[
              "h-1.5 w-1.5 rounded-full transition-colors duration-200",
              i < current
                ? "bg-cold-cyan/60"
                : i === current
                  ? "bg-cold-cyan"
                  : "bg-line-steel/30",
            ].join(" ")}
          />
        </div>
      ))}
      <span className="ml-1.5 text-[10px] text-text-secondary/60">
        {hasOverview
          ? VAULT_LABELS.overviewComplete[lang]
          : VAULT_LABELS.rawStone[lang]}
      </span>
    </div>
  );
}
