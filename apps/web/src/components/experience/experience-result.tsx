"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MineBackground } from "@/components/backgrounds/mine-background";
import { SectionCard } from "@/components/shared/section-card";
import { usePrefersReducedMotion } from "@/components/shared/use-prefers-reduced-motion";
import { SoftGatePanel } from "./soft-gate-panel";
import { trackExperienceEvent } from "@/lib/experience-events";
import type { ExperienceIdea, ExperienceVein } from "@/types/experience";

type ExperienceResultProps = {
  vein: ExperienceVein;
  ideas: ExperienceIdea[];
};

const RARITY_LABEL: Record<ExperienceVein["rarity"], string> = {
  common: "Common",
  rare: "Rare",
  golden: "Golden",
};

export function ExperienceResult({ vein, ideas }: ExperienceResultProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const animateMotion = prefersReducedMotion === false;
  const currentPath = `/experience/${vein.id}`;

  useEffect(() => {
    trackExperienceEvent({
      eventName: "experience_result_view",
      route: currentPath,
      veinId: vein.id,
    });
  }, [vein.id, currentPath]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <MineBackground />

      {/* Sticky guest header — matches AppShell sticky pattern */}
      <header className="sticky top-0 z-30 border-b border-line-steel/20 bg-bg-deep/70 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
          <Link
            href="/experience"
            className="text-xs uppercase tracking-[0.28em] text-text-secondary/75 hover:text-cold-cyan"
          >
            ← back to veins
          </Link>
          <span className="hidden text-[11px] uppercase tracking-[0.22em] text-cold-cyan/75 lg:inline">
            experience preview
          </span>
          <Link
            href="/auth/sign-in?next=/mine"
            className="rounded-md border border-cold-cyan/30 bg-cold-cyan/10 px-3 py-1.5 text-xs text-cold-cyan transition-all hover:bg-cold-cyan/20"
          >
            Sign in
          </Link>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">

        <motion.section
          initial={animateMotion ? { opacity: 0, y: 14 } : false}
          animate={animateMotion ? { opacity: 1, y: 0 } : undefined}
          transition={animateMotion ? { duration: 0.35, ease: "easeOut" } : undefined}
          className="mx-auto w-full max-w-4xl flex-1 space-y-6 pb-10"
        >
          {/* Vein summary */}
          <div className="rounded-[28px] border border-line-steel/55 bg-[linear-gradient(180deg,rgba(10,18,31,0.92)_0%,rgba(6,12,24,0.86)_100%)] p-5 backdrop-blur-xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-[0.28em] text-cold-cyan/70">
                  {vein.codename}
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-text-primary sm:text-3xl">
                  {vein.previewLineKo}
                </h1>
                <p className="mt-2 text-xs text-text-secondary/60">
                  {vein.previewLineEn}
                </p>
              </div>
              <span className="rounded-full border border-line-steel/45 bg-surface-1/70 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-text-secondary/70">
                {RARITY_LABEL[vein.rarity]}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {vein.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="rounded-full border border-line-steel/35 bg-surface-1/50 px-3 py-1 text-xs text-text-secondary"
                >
                  {kw.ko}
                </span>
              ))}
            </div>
          </div>

          {/* Explanatory block */}
          <div className="rounded-2xl border border-cold-cyan/15 bg-[rgba(92,205,229,0.04)] p-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-cold-cyan/70">
              sample exploration
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              이 광맥의 키워드 조합에서 AI가 찾아낸 샘플 아이디어 3개입니다. 실제
              Mine에서는 저장, 상세 분석, 재생성, 전체 결과 탐색을 계속할 수 있어요.
            </p>
          </div>

          {/* 3 demo ideas */}
          <div className="space-y-4">
            {ideas.map((idea, index) => (
              <SectionCard
                key={idea.id}
                title={`아이디어 ${index + 1}. ${idea.titleKo}`}
              >
                <p className="text-sm leading-6 text-text-secondary">
                  {idea.summaryKo}
                </p>
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-cold-cyan/15 bg-[rgba(92,205,229,0.05)] p-3">
                  <span className="mt-0.5 text-[10px] uppercase tracking-[0.24em] text-cold-cyan/70">
                    signal
                  </span>
                  <p className="text-xs leading-5 text-text-primary/80">
                    {idea.signalLineKo}
                  </p>
                </div>
              </SectionCard>
            ))}
          </div>

          {/* Soft gates */}
          <div className="space-y-4 pt-2">
            <SoftGatePanel
              title="이 방향을 저장하고 이어서 탐색하려면"
              body="로그인하면 이 광맥을 Vault에 저장하고, 개요서와 감정으로 이어갈 수 있어요. 실제 Mine에는 매일 새 광맥이 열립니다."
              ctaLabel="로그인하고 내 Mine으로 이동"
              next={currentPath}
              secondaryLabel="Google, GitHub로 10초면 시작"
              onImpression={() =>
                trackExperienceEvent({
                  eventName: "experience_gate_impression",
                  route: currentPath,
                  veinId: vein.id,
                  metadata: { gate: "primary_save" },
                })
              }
              onCtaClick={() =>
                trackExperienceEvent({
                  eventName: "experience_gate_click",
                  route: currentPath,
                  veinId: vein.id,
                  metadata: { gate: "primary_save" },
                })
              }
            />

            {/* Locked affordances — lighter weight */}
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-xl border border-line-steel/25 bg-bg-deep/40 px-4 py-3">
                <span className="text-[10px] uppercase tracking-[0.24em] text-text-secondary/60">
                  🔒 Locked
                </span>
                <span className="text-xs text-text-secondary/75">
                  전체 결과 탐색
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-line-steel/25 bg-bg-deep/40 px-4 py-3">
                <span className="text-[10px] uppercase tracking-[0.24em] text-text-secondary/60">
                  🔒 Locked
                </span>
                <span className="text-xs text-text-secondary/75">
                  개요서 생성
                </span>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
