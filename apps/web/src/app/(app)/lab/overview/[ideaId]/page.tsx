"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Trash2, RefreshCw } from "lucide-react";
import { LabBackground } from "@/components/backgrounds/lab-background";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ProgressSteps } from "@/components/shared/progress-steps";
import { SectionCard } from "@/components/shared/section-card";
import { vaultApi, labApi } from "@/lib/api";
import type { Overview } from "@/types/api";

// --- Loading state ---

const LOADING_MESSAGES = [
  { text: "아이디어를 분석하는 중...", at: 0 },
  { text: "키워드 조합을 해석하는 중...", at: 3000 },
  { text: "시장 데이터를 수집하는 중...", at: 7000 },
  { text: "문제 정의를 작성하는 중...", at: 12000 },
  { text: "핵심 기능을 설계하는 중...", at: 18000 },
  { text: "비즈니스 모델을 구성하는 중...", at: 25000 },
  { text: "MVP 범위를 정리하는 중...", at: 32000 },
];

const WAITING_MESSAGES = [
  "거의 다 됐어요...",
  "마지막 문단을 다듬는 중...",
  "품질을 검토하는 중...",
  "읽기 좋게 정리하는 중...",
  "조금만 더 기다려주세요...",
];

function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [waitingIndex, setWaitingIndex] = useState(0);
  const [dots, setDots] = useState("");

  // Elapsed timer (100ms intervals for smooth progress)
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Phase message transitions
  useEffect(() => {
    const timers = LOADING_MESSAGES.slice(1).map((msg, i) =>
      setTimeout(() => setMessageIndex(i + 1), msg.at),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Waiting message rotation (after all phases done)
  const allPhasesDone = elapsed > LOADING_MESSAGES[LOADING_MESSAGES.length - 1].at + 5000;

  useEffect(() => {
    if (!allPhasesDone) return;
    const interval = setInterval(() => {
      setWaitingIndex((prev) => (prev + 1) % WAITING_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [allPhasesDone]);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Progress: fast at start, slows down, never reaches 100%
  const progressPercent = Math.min(93, 25 * Math.log(1 + elapsed / 12000) * 10);

  const displayMessage = allPhasesDone
    ? WAITING_MESSAGES[waitingIndex]
    : LOADING_MESSAGES[messageIndex].text;

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      {/* Pulsing orb */}
      <div className="relative mb-8">
        <div className="h-4 w-4 rounded-full bg-cold-cyan/60 shadow-[0_0_20px_rgba(92,205,229,0.3)]" />
        <div className="absolute inset-0 animate-ping rounded-full bg-cold-cyan/20" />
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-1 w-56 overflow-hidden rounded-full bg-surface-2/40">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cold-cyan/40 via-cold-cyan/70 to-cold-cyan/40"
          style={{
            width: `${progressPercent}%`,
            transition: "width 0.3s ease-out",
          }}
        />
      </div>

      {/* Message */}
      <p className="h-5 text-sm text-text-secondary">
        {displayMessage}
      </p>

      {/* Elapsed time + dots */}
      <p className="mt-2 text-[11px] text-text-secondary/30">
        {Math.floor(elapsed / 1000)}초 경과{dots}
      </p>
    </div>
  );
}

// --- Full overview loading ---

const FULL_OVERVIEW_MESSAGES = [
  { text: "제품 구조를 분석하는 중...", at: 0 },
  { text: "비전과 문제를 정의하는 중...", at: 5000 },
  { text: "핵심 기능을 설계하는 중...", at: 12000 },
  { text: "사용자 흐름을 구성하는 중...", at: 20000 },
  { text: "기술 스택을 선정하는 중...", at: 28000 },
  { text: "데이터 모델을 설계하는 중...", at: 36000 },
  { text: "API 엔드포인트를 정의하는 중...", at: 44000 },
  { text: "문서를 최종 검토하는 중...", at: 52000 },
];

const FULL_OVERVIEW_WAITING = [
  "거의 완성됐어요...",
  "15개 섹션을 교차 검증하는 중...",
  "마지막 품질 점검 중...",
  "조금만 더 기다려주세요...",
];

function FullOverviewLoading() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [waitingIndex, setWaitingIndex] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => setElapsed((p) => p + 100), 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timers = FULL_OVERVIEW_MESSAGES.slice(1).map((msg, i) =>
      setTimeout(() => setMessageIndex(i + 1), msg.at),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const allDone = elapsed > FULL_OVERVIEW_MESSAGES[FULL_OVERVIEW_MESSAGES.length - 1].at + 5000;

  useEffect(() => {
    if (!allDone) return;
    const interval = setInterval(() => {
      setWaitingIndex((p) => (p + 1) % FULL_OVERVIEW_WAITING.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [allDone]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((p) => (p.length >= 3 ? "" : p + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const progress = Math.min(93, 30 * Math.log(1 + elapsed / 20000) * 10);
  const displayMessage = allDone
    ? FULL_OVERVIEW_WAITING[waitingIndex]
    : FULL_OVERVIEW_MESSAGES[messageIndex].text;

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      <div className="relative mb-6">
        <div className="h-5 w-5 rounded-full bg-cold-cyan/50 shadow-[0_0_30px_rgba(92,205,229,0.4)]" />
        <div className="absolute inset-0 animate-ping rounded-full bg-cold-cyan/20" />
      </div>

      <h3 className="mb-4 text-base font-semibold text-text-primary">
        풀 개요서 생성 중
      </h3>

      <div className="mb-4 h-1 w-64 overflow-hidden rounded-full bg-surface-2/40">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cold-cyan/40 via-cold-cyan/70 to-cold-cyan/40"
          style={{ width: `${progress}%`, transition: "width 0.3s ease-out" }}
        />
      </div>

      <p className="h-5 text-sm text-text-secondary">{displayMessage}</p>

      <p className="mt-2 text-[11px] text-text-secondary/30">
        {Math.floor(elapsed / 1000)}초 경과{dots}
      </p>

      <p className="mt-6 max-w-xs text-center text-[11px] text-text-secondary/30">
        Narrative 9섹션 + Technical 6섹션을 한 번에 생성합니다.
        보통 30~60초 정도 소요됩니다.
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

// --- Overview sections (reused for both latest and older versions) ---

function OverviewSections({ overview }: { overview: Overview }) {
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
    </div>
  );
}

// --- Older version item ---

function OlderOverviewItem({
  overview,
  onDelete,
  isDeleting,
}: {
  overview: Overview;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="group rounded-lg border border-line-steel/15 bg-surface-1/20 transition-opacity hover:opacity-100 opacity-60">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          <span>
            {new Date(overview.created_at).toLocaleDateString("ko-KR")}
          </span>
          <span className="text-xs text-text-secondary/40">
            {expanded ? "접기" : "펼치기"}
          </span>
        </button>

        <div className="flex items-center gap-2">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">삭제?</span>
              <button
                type="button"
                onClick={() => onDelete(overview.id)}
                disabled={isDeleting}
                className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-400/10"
              >
                확인
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="cursor-pointer rounded px-2 py-1 text-xs text-text-secondary transition-colors hover:text-text-primary"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="cursor-pointer rounded p-1.5 text-text-secondary/30 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-400/10 hover:text-red-400"
              title="삭제"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-line-steel/10 px-4 py-4">
          <OverviewSections overview={overview} />
        </div>
      )}
    </div>
  );
}

// --- Overview display ---

function OverviewDisplay({
  overview,
  ideaId,
  onRegenerate,
  isRegenerating,
}: {
  overview: Overview;
  ideaId: string;
  onRegenerate: () => void;
  isRegenerating: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Check if full overview already exists
  const fullOverviewQuery = useQuery({
    queryKey: ["fullOverviews", overview.id],
    queryFn: () => labApi.getFullOverviewsByOverview(overview.id),
    enabled: !!overview.id,
  });

  const latestFullOverview = fullOverviewQuery.data?.[0] ?? null;

  const fullOverviewMutation = useMutation({
    mutationFn: () => labApi.createFullOverview(overview.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["fullOverviews", overview.id],
      });
      router.push(`/lab/full/${overview.id}`);
    },
  });

  // Show full-screen loading when generating full overview
  if (fullOverviewMutation.isPending) {
    return <FullOverviewLoading />;
  }

  // Show error state for full overview generation
  if (fullOverviewMutation.isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-red-400">풀 개요 생성에 실패했습니다</p>
        <p className="mt-1 text-xs text-text-secondary/60">
          {fullOverviewMutation.error instanceof Error
            ? fullOverviewMutation.error.message
            : "알 수 없는 오류"}
        </p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => fullOverviewMutation.mutate()}
            className="cursor-pointer rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all hover:bg-cold-cyan/20"
          >
            다시 시도
          </button>
          <button
            onClick={() => fullOverviewMutation.reset()}
            className="cursor-pointer rounded-lg border border-line-steel/30 bg-surface-2/50 px-5 py-2.5 text-sm text-text-secondary transition-all hover:text-text-primary"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OverviewSections overview={overview} />

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 border-t border-line-steel/20 pt-4">
        {/* Primary */}
        <Link
          href={`/lab/appraisal/${overview.id}`}
          className="cursor-pointer rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all duration-200 hover:bg-cold-cyan/20 hover:shadow-[0_0_20px_rgba(92,205,229,0.1)]"
        >
          감정 요청하기
        </Link>
        {/* Regenerate */}
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isRegenerating}
          className={[
            "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-all duration-200",
            isRegenerating
              ? "cursor-not-allowed border-line-steel/20 bg-surface-2/30 text-text-secondary/50 opacity-50"
              : "border-cold-cyan/30 bg-cold-cyan/10 text-cold-cyan hover:bg-cold-cyan/20 hover:shadow-[0_0_20px_rgba(92,205,229,0.1)]",
          ].join(" ")}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
          {isRegenerating ? "재생성 중..." : "재생성"}
        </button>
        {/* Full overview */}
        {latestFullOverview ? (
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

  // Load all overviews for this idea (newest first)
  const overviewsQuery = useQuery({
    queryKey: ["overviews", ideaId],
    queryFn: () => vaultApi.getOverviewsByIdea(ideaId),
    enabled: !!ideaId,
  });

  const overviews = overviewsQuery.data ?? [];
  const latestOverview = overviews[0] ?? null;
  const olderOverviews = overviews.slice(1);

  // Create overview mutation
  const createMutation = useMutation({
    mutationFn: () => labApi.createOverview(ideaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overviews", ideaId] });
    },
  });

  // Delete overview mutation
  const deleteMutation = useMutation({
    mutationFn: (overviewId: string) => vaultApi.deleteOverview(overviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overviews", ideaId] });
    },
  });

  const idea = ideaQuery.data;
  const isLoading = ideaQuery.isLoading || overviewsQuery.isLoading;

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
              ) : latestOverview ? (
                <>
                  <OverviewDisplay
                    overview={latestOverview}
                    ideaId={ideaId}
                    onRegenerate={() => createMutation.mutate()}
                    isRegenerating={createMutation.isPending}
                  />

                  {/* Older versions */}
                  {olderOverviews.length > 0 && (
                    <OlderOverviewsSection
                      overviews={olderOverviews}
                      onDelete={(id) => deleteMutation.mutate(id)}
                      isDeleting={deleteMutation.isPending}
                    />
                  )}
                </>
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

// --- Older versions collapsible section ---

function OlderOverviewsSection({
  overviews,
  onDelete,
  isDeleting,
}: {
  overviews: Overview[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-t border-line-steel/15 mt-8 pt-6">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex cursor-pointer items-center gap-2 text-sm font-medium text-text-secondary/60 transition-colors hover:text-text-primary"
      >
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        이전 버전 ({overviews.length}개)
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          {overviews.map((overview) => (
            <OlderOverviewItem
              key={overview.id}
              overview={overview}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
