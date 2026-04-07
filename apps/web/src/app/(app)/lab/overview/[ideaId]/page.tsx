"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LabBackground } from "@/components/backgrounds/lab-background";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ProgressSteps } from "@/components/shared/progress-steps";
import { SectionCard } from "@/components/shared/section-card";
import { vaultApi, labApi } from "@/lib/api";
import type { Overview } from "@/types/api";

// --- Loading phases ---

const LOADING_PHASES = [
  { text: "아이디어를 분석하는 중...", delay: 0 },
  { text: "개요를 작성하는 중...", delay: 4000 },
  { text: "마무리 검토 중...", delay: 8000 },
];

function LoadingState() {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const timers = LOADING_PHASES.slice(1).map((phase, i) =>
      setTimeout(() => setPhaseIndex(i + 1), phase.delay),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const progress = ((phaseIndex + 1) / LOADING_PHASES.length) * 100;

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      {/* Progress bar */}
      <div className="mb-6 h-1 w-48 overflow-hidden rounded-full bg-surface-2/60">
        <div
          className="h-full rounded-full bg-cold-cyan/60 transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-text-secondary transition-opacity duration-500">
        {LOADING_PHASES[phaseIndex].text}
      </p>
      <p className="mt-2 text-[11px] text-text-secondary/40">
        {phaseIndex + 1} / {LOADING_PHASES.length}
      </p>
    </div>
  );
}

// --- Section group ---

function SectionGroup({
  label,
  children,
  delay = 0,
}: {
  label: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="space-y-3"
    >
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary/40">
          {label}
        </span>
        <div className="h-px flex-1 bg-line-steel/15" />
      </div>
      {children}
    </motion.div>
  );
}

// --- Overview display ---

function OverviewDisplay({
  overview,
  ideaId,
}: {
  overview: Overview;
  ideaId: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Check if full overview already exists
  const fullOverviewQuery = useQuery({
    queryKey: ["fullOverview", overview.id],
    queryFn: () => labApi.getFullOverview(overview.id),
    enabled: !!overview.id,
  });

  const fullOverviewMutation = useMutation({
    mutationFn: () => labApi.createFullOverview(overview.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["fullOverview", overview.id],
      });
      router.push(`/lab/full/${overview.id}`);
    },
  });

  return (
    <div className="space-y-6">
      {/* Vision */}
      <SectionGroup label="Vision" delay={0}>
        <SectionCard title="컨셉">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {overview.concept_ko}
          </p>
        </SectionCard>
        <SectionCard title="문제 정의">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {overview.problem_ko}
          </p>
        </SectionCard>
        <SectionCard title="타깃 사용자">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {overview.target_ko}
          </p>
        </SectionCard>
      </SectionGroup>

      {/* Product */}
      <SectionGroup label="Product" delay={0.1}>
        <SectionCard title="핵심 기능">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {overview.features_ko}
          </p>
        </SectionCard>
        <SectionCard title="차별점">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {overview.differentiator_ko}
          </p>
        </SectionCard>
      </SectionGroup>

      {/* Business */}
      <SectionGroup label="Business" delay={0.2}>
        <SectionCard title="수익 모델">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {overview.revenue_ko}
          </p>
        </SectionCard>
        <SectionCard title="MVP 범위">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {overview.mvp_scope_ko}
          </p>
        </SectionCard>
      </SectionGroup>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 border-t border-line-steel/20 pt-4">
        {/* Primary */}
        <Link
          href={`/lab/appraisal/${overview.id}`}
          className="cursor-pointer rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all duration-200 hover:bg-cold-cyan/20 hover:shadow-[0_0_20px_rgba(92,205,229,0.1)]"
        >
          감정 요청하기
        </Link>
        {/* Secondary */}
        {fullOverviewQuery.data ? (
          <Link
            href={`/lab/full/${overview.id}`}
            className="cursor-pointer rounded-lg border border-line-steel/30 bg-surface-2/50 px-5 py-2.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:border-cold-cyan/20 hover:text-text-primary"
          >
            풀 개요 보기
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => fullOverviewMutation.mutate()}
            disabled={fullOverviewMutation.isPending}
            className={[
              "cursor-pointer rounded-lg border px-5 py-2.5 text-sm font-medium transition-all duration-200",
              fullOverviewMutation.isPending
                ? "cursor-not-allowed border-line-steel/20 bg-surface-2/30 text-text-secondary/50 opacity-50"
                : "border-line-steel/30 bg-surface-2/50 text-text-secondary hover:border-cold-cyan/20 hover:text-text-primary",
            ].join(" ")}
          >
            {fullOverviewMutation.isPending
              ? "풀 개요 생성 중..."
              : "풀 개요 생성"}
          </button>
        )}
        {/* Tertiary */}
        <Link
          href={`/vault/${ideaId}`}
          className="cursor-pointer rounded-lg border border-line-steel/20 bg-transparent px-5 py-2.5 text-sm text-text-secondary/70 transition-colors duration-200 hover:text-text-primary"
        >
          금고로
        </Link>
      </div>
    </div>
  );
}

// --- Page ---

const WORKFLOW_STEPS = ["Mine", "Vault", "개요", "감정", "풀 개요"];

export default function LabOverviewPage({
  params,
}: {
  params: Promise<{ ideaId: string }>;
}) {
  const { ideaId } = use(params);
  const queryClient = useQueryClient();

  // Load idea
  const ideaQuery = useQuery({
    queryKey: ["vaultedIdeas"],
    queryFn: vaultApi.getVaultedIdeas,
    select: (ideas) => ideas.find((i) => i.id === ideaId),
  });

  // Load existing overview
  const overviewQuery = useQuery({
    queryKey: ["overview", ideaId],
    queryFn: () => vaultApi.getOverviewByIdea(ideaId),
    enabled: !!ideaId,
  });

  // Create overview mutation
  const createMutation = useMutation({
    mutationFn: () => labApi.createOverview(ideaId),
    onSuccess: (data) => {
      queryClient.setQueryData(["overview", ideaId], data);
    },
  });

  const idea = ideaQuery.data;
  const overview = overviewQuery.data;
  const isLoading = ideaQuery.isLoading || overviewQuery.isLoading;

  return (
    <div className="relative flex min-h-0 flex-1">
      <LabBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Lab", href: "/lab" },
              { label: "개요" },
              ...(idea ? [{ label: idea.title_ko }] : []),
            ]}
          />

          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-7 w-2/3 rounded bg-surface-2/60" />
              <div className="h-4 w-full rounded bg-surface-2/40" />
              <div className="mt-6 grid gap-4">
                <div className="h-24 rounded-lg bg-surface-2/30" />
                <div className="h-24 rounded-lg bg-surface-2/30" />
              </div>
            </div>
          ) : !idea ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-text-secondary">
                아이디어를 찾을 수 없습니다
              </p>
              <Link
                href="/vault"
                className="mt-4 cursor-pointer rounded-lg border border-line-steel bg-surface-2 px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary"
              >
                금고로 돌아가기
              </Link>
            </div>
          ) : (
            <>
              {/* Progress steps */}
              <ProgressSteps steps={WORKFLOW_STEPS} currentStep={2} />

              {/* Idea title */}
              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  {idea.title_ko}
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {idea.summary_ko}
                </p>
              </div>

              {/* Overview content or create button */}
              {createMutation.isPending ? (
                <LoadingState />
              ) : createMutation.isError ? (
                <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-4 text-center">
                  <p className="text-sm text-red-400">
                    개요 생성에 실패했습니다
                  </p>
                  <p className="mt-1 text-xs text-text-secondary/60">
                    {createMutation.error instanceof Error
                      ? createMutation.error.message
                      : "알 수 없는 오류"}
                  </p>
                  <button
                    type="button"
                    onClick={() => createMutation.mutate()}
                    className="mt-3 cursor-pointer rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all duration-200 hover:bg-cold-cyan/20"
                  >
                    다시 시도
                  </button>
                </div>
              ) : overview ? (
                <OverviewDisplay overview={overview} ideaId={ideaId} />
              ) : createMutation.data ? (
                <OverviewDisplay
                  overview={createMutation.data}
                  ideaId={ideaId}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-line-steel/30 bg-surface-1/30 p-8 text-center">
                  <p className="mb-4 text-sm text-text-secondary">
                    이 아이디어의 개요를 AI가 분석하여 생성합니다
                  </p>
                  <button
                    type="button"
                    onClick={() => createMutation.mutate()}
                    className="cursor-pointer rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-6 py-3 text-sm font-medium text-cold-cyan transition-all duration-200 hover:bg-cold-cyan/20 hover:shadow-[0_0_20px_rgba(92,205,229,0.15)]"
                  >
                    개요 생성
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
