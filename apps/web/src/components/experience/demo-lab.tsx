"use client";

import { useMemo } from "react";
import Link from "next/link";
import { LabBackground } from "@/components/backgrounds/lab-background";
import { IdeaRow } from "@/components/lab/idea-row";
import { LAB_LABELS } from "@/components/lab/lab-labels";
import { OverviewRow } from "@/components/lab/overview-row";
import { SectionHeader } from "@/components/lab/section-header";
import { PageHeader } from "@/components/shared/page-header";
import { useLanguage } from "@/hooks/use-language";
import {
  getDemoOverviewMap,
  getDemoVaultedIdeas,
} from "@/lib/experience-data";

/**
 * DemoLab — 게스트가 /lab을 방문했을 때 보여주는 데모 모드.
 *
 * 실제 Lab의 IdeaRow/OverviewRow를 재사용. 9개 데모 idea 중
 * 5개는 "Pending overview" (아직 개요 없음), 4개는 "Recent documents"로 분류.
 * 모든 Link 클릭은 sign-in으로 유도.
 */
export function DemoLab() {
  const { lang } = useLanguage();
  const ideas = useMemo(() => getDemoVaultedIdeas(), []);
  const overviewMap = useMemo(() => getDemoOverviewMap(), []);

  const ideasWithoutOverview = ideas.filter((i) => !overviewMap[i.id]);
  const ideasWithOverview = ideas.filter((i) => overviewMap[i.id]);

  const handleRowGate = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = "/auth/sign-in?next=/lab";
  };

  return (
    <div className="relative flex min-h-0 flex-1">
      <LabBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Header — 실제 Lab과 동일한 PageHeader */}
        <div className="mx-auto mb-6 w-full max-w-5xl">
          <PageHeader
            eyebrow={LAB_LABELS.eyebrow[lang]}
            title={LAB_LABELS.title[lang]}
            subtitle={LAB_LABELS.subtitle[lang]}
          />
        </div>

        <div className="mx-auto w-full max-w-5xl flex-1 space-y-8">
          {/* Section: Pending overview */}
          <section className="space-y-3">
            <SectionHeader
              title={LAB_LABELS.pendingOverview[lang]}
              count={ideasWithoutOverview.length}
            />
            <div className="space-y-2">
              {ideasWithoutOverview.map((idea) => (
                <IdeaRow
                  key={idea.id}
                  idea={idea}
                  lang={lang}
                  onClickOverride={handleRowGate}
                />
              ))}
            </div>
          </section>

          {/* Section: Recent documents */}
          <section className="space-y-3">
            <SectionHeader
              title={LAB_LABELS.recentDocuments[lang]}
              count={ideasWithOverview.length}
            />
            <div className="space-y-2">
              {ideasWithOverview.map((idea) => (
                <OverviewRow
                  key={idea.id}
                  idea={idea}
                  overview={overviewMap[idea.id]!}
                  lang={lang}
                  onClickOverride={handleRowGate}
                />
              ))}
            </div>
          </section>
        </div>

        {/* 데모 컨텍스트 안내 */}
        <div className="mx-auto mt-6 w-full max-w-5xl">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-cold-cyan/15 bg-[rgba(92,205,229,0.04)] px-5 py-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-xs leading-5 text-text-secondary sm:text-sm">
              <span className="font-semibold text-cold-cyan">
                {LAB_LABELS.demoSampleNotice[lang]}
              </span>
              <span className="mx-2 text-text-secondary/40">·</span>
              {LAB_LABELS.demoFreshNotice[lang]}
            </p>
            <Link
              href="/auth/sign-in?next=/lab"
              className="shrink-0 rounded-lg border border-cold-cyan/40 bg-cold-cyan/15 px-4 py-2 text-xs font-medium text-cold-cyan transition-all hover:bg-cold-cyan/25"
            >
              {LAB_LABELS.demoMyLabCta[lang]}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
