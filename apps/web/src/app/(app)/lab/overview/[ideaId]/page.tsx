"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LabBackground } from "@/components/backgrounds/lab-background";
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

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      <div className="mb-6 h-3 w-3 animate-pulse rounded-full bg-cold-cyan/60" />
      <p className="text-sm text-text-secondary transition-opacity duration-500">
        {LOADING_PHASES[phaseIndex].text}
      </p>
    </div>
  );
}

// --- Section card ---

function OverviewSection({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div className="rounded-lg border border-line-steel/20 bg-surface-1/40 p-4">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-cold-cyan/80">
        {title}
      </h4>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
        {content}
      </p>
    </div>
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
      <div className="grid gap-3">
        <OverviewSection title="컨셉" content={overview.concept_ko} />
        <OverviewSection title="문제 정의" content={overview.problem_ko} />
        <OverviewSection title="타깃 사용자" content={overview.target_ko} />
        <OverviewSection title="핵심 기능" content={overview.features_ko} />
        <OverviewSection title="차별점" content={overview.differentiator_ko} />
        <OverviewSection title="수익 모델" content={overview.revenue_ko} />
        <OverviewSection title="MVP 범위" content={overview.mvp_scope_ko} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 border-t border-line-steel/20 pt-4">
        <Link
          href={`/lab/appraisal/${overview.id}`}
          className="rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all hover:bg-cold-cyan/20"
        >
          감정 요청하기
        </Link>
        {fullOverviewQuery.data ? (
          <Link
            href={`/lab/full/${overview.id}`}
            className="rounded-lg border border-line-steel/30 bg-surface-2/50 px-5 py-2.5 text-sm font-medium text-text-secondary transition-all hover:border-cold-cyan/20 hover:text-text-primary"
          >
            풀 개요 보기
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => fullOverviewMutation.mutate()}
            disabled={fullOverviewMutation.isPending}
            className={[
              "rounded-lg border px-5 py-2.5 text-sm font-medium transition-all",
              fullOverviewMutation.isPending
                ? "cursor-not-allowed border-line-steel/20 bg-surface-2/30 text-text-secondary/50"
                : "border-line-steel/30 bg-surface-2/50 text-text-secondary hover:border-cold-cyan/20 hover:text-text-primary",
            ].join(" ")}
          >
            {fullOverviewMutation.isPending
              ? "풀 개요 생성 중..."
              : "풀 개요 생성"}
          </button>
        )}
        <Link
          href={`/vault/${ideaId}`}
          className="rounded-lg border border-line-steel/30 bg-surface-2/50 px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          금고로 돌아가기
        </Link>
      </div>
    </div>
  );
}

// --- Page ---

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

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Back link */}
        <div className="mx-auto mb-6 w-full max-w-2xl">
          <Link
            href="/lab"
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-current"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            실험실로 돌아가기
          </Link>
        </div>

        {/* Content */}
        <div className="mx-auto w-full max-w-2xl flex-1">
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
                className="mt-4 rounded-lg border border-line-steel bg-surface-2 px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                금고로 돌아가기
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
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
                    className="mt-3 rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all hover:bg-cold-cyan/20"
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
                    className="rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-6 py-3 text-sm font-medium text-cold-cyan transition-all hover:bg-cold-cyan/20 hover:shadow-[0_0_20px_rgba(92,205,229,0.15)]"
                  >
                    개요 생성
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
