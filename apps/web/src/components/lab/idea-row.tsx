"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LAB_LABELS, type LabLanguage } from "./lab-labels";
import type { Idea } from "@/types/api";

type IdeaRowProps = {
  idea: Idea;
  lang: LabLanguage;
  /** 클릭 시 기본 링크 대신 커스텀 동작 (데모 모드 등) */
  onClickOverride?: (e: React.MouseEvent) => void;
};

export function IdeaRow({ idea, lang, onClickOverride }: IdeaRowProps) {
  const title = lang === "en" && idea.title_en ? idea.title_en : idea.title_ko;
  const summary =
    lang === "en" && idea.summary_en ? idea.summary_en : idea.summary_ko;

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
        <p className="mt-0.5 truncate text-xs text-text-secondary">
          {summary}
        </p>
      </div>
      <div className="ml-4 flex shrink-0 items-center gap-2">
        <span className="text-xs font-medium text-cold-cyan/70 transition-colors group-hover:text-cold-cyan">
          {LAB_LABELS.generateOverview[lang]}
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-cold-cyan/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-cold-cyan" />
      </div>
    </Link>
  );
}
