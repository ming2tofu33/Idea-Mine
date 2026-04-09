"use client";

import Link from "next/link";
import { LAB_LABELS, type LabLanguage } from "./lab-labels";
import { StatusBadge } from "./status-badge";
import type { Idea, Overview } from "@/types/api";

type OverviewRowProps = {
  idea: Idea;
  overview: Overview;
  lang: LabLanguage;
  /** 클릭 시 기본 링크 대신 커스텀 동작 (데모 모드 등) */
  onClickOverride?: (e: React.MouseEvent) => void;
};

export function OverviewRow({
  idea,
  overview,
  lang,
  onClickOverride,
}: OverviewRowProps) {
  const title = lang === "en" && idea.title_en ? idea.title_en : idea.title_ko;
  const concept =
    lang === "en" && overview.concept_en
      ? overview.concept_en
      : overview.concept_ko;

  return (
    <Link
      href={`/lab/collection/${idea.id}`}
      onClick={onClickOverride}
      className="group flex cursor-pointer items-center justify-between rounded-xl border border-line-steel/20 bg-surface-1/40 p-4 transition-all duration-200 hover:border-cold-cyan/20 hover:bg-surface-1/60"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary transition-colors group-hover:text-cold-cyan">
          {title}
        </p>
        <p className="mt-0.5 truncate text-xs text-text-secondary">{concept}</p>
      </div>
      <div className="ml-4 flex shrink-0 items-center gap-2">
        <StatusBadge label={LAB_LABELS.overview[lang]} active />
      </div>
    </Link>
  );
}
