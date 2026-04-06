"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { LabBackground } from "@/components/backgrounds/lab-background";
import { labApi } from "@/lib/api";
import type { Appraisal } from "@/types/api";

// --- Loading ---

function LoadingState() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      <div className="mb-6 h-3 w-3 animate-pulse rounded-full bg-cold-cyan/60" />
      <p className="text-sm text-text-secondary">
        아이디어를 감정하는 중{dots}
      </p>
    </div>
  );
}

// --- Dimension card ---

const DIMENSION_LABELS: Record<string, string> = {
  market_fit: "시장 적합성",
  problem_fit: "문제 적합성",
  feasibility: "실현 가능성",
  differentiation: "차별화",
  scalability: "확장성",
  risk: "리스크",
};

function DimensionCard({
  dimension,
  content,
}: {
  dimension: string;
  content: string;
}) {
  const label = DIMENSION_LABELS[dimension] ?? dimension;

  return (
    <div className="rounded-lg border border-line-steel/20 bg-surface-1/40 p-4">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-cold-cyan/80">
        {label}
      </h4>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
        {content}
      </p>
    </div>
  );
}

// --- Appraisal display ---

function AppraisalDisplay({ appraisal }: { appraisal: Appraisal }) {
  const dimensions: { key: string; content: string }[] = [
    { key: "market_fit", content: appraisal.market_fit_ko },
    ...(appraisal.problem_fit_ko
      ? [{ key: "problem_fit", content: appraisal.problem_fit_ko }]
      : []),
    { key: "feasibility", content: appraisal.feasibility_ko },
    ...(appraisal.differentiation_ko
      ? [{ key: "differentiation", content: appraisal.differentiation_ko }]
      : []),
    ...(appraisal.scalability_ko
      ? [{ key: "scalability", content: appraisal.scalability_ko }]
      : []),
    { key: "risk", content: appraisal.risk_ko },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-cold-cyan/30 bg-cold-cyan/10 px-2.5 py-0.5 text-[10px] font-medium text-cold-cyan">
          {appraisal.depth}
        </span>
      </div>
      <div className="grid gap-3">
        {dimensions.map((dim) => (
          <DimensionCard
            key={dim.key}
            dimension={dim.key}
            content={dim.content}
          />
        ))}
      </div>
    </div>
  );
}

// --- Page ---

export default function LabAppraisalPage({
  params,
}: {
  params: Promise<{ overviewId: string }>;
}) {
  const { overviewId } = use(params);
  const queryClient = useQueryClient();

  // Load existing appraisals
  const appraisalsQuery = useQuery({
    queryKey: ["appraisals", overviewId],
    queryFn: () => labApi.getAppraisalsByOverview(overviewId),
    enabled: !!overviewId,
  });

  // Create appraisal mutation
  const createMutation = useMutation({
    mutationFn: () => labApi.createAppraisal(overviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["appraisals", overviewId],
      });
    },
  });

  const appraisals = appraisalsQuery.data ?? [];
  const hasAppraisals = appraisals.length > 0;

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
          <div className="mb-6">
            <h2 className="text-xl font-bold text-text-primary">감정 결과</h2>
            <p className="mt-1 text-sm text-text-secondary">
              AI가 아이디어의 잠재력을 다양한 차원에서 분석합니다
            </p>
          </div>

          {appraisalsQuery.isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-24 rounded-lg bg-surface-2/30" />
              <div className="h-24 rounded-lg bg-surface-2/30" />
              <div className="h-24 rounded-lg bg-surface-2/30" />
            </div>
          ) : createMutation.isPending ? (
            <LoadingState />
          ) : createMutation.isError ? (
            <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-4 text-center">
              <p className="text-sm text-red-400">감정에 실패했습니다</p>
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
          ) : hasAppraisals ? (
            <div className="space-y-8">
              {appraisals.map((appraisal) => (
                <AppraisalDisplay key={appraisal.id} appraisal={appraisal} />
              ))}

              {/* Request another appraisal */}
              <div className="border-t border-line-steel/20 pt-4">
                <button
                  type="button"
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending}
                  className="rounded-lg border border-line-steel/30 bg-surface-2/50 px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-cold-cyan/20 hover:text-text-primary"
                >
                  추가 감정 요청
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-line-steel/30 bg-surface-1/30 p-8 text-center">
              <p className="mb-4 text-sm text-text-secondary">
                AI가 아이디어의 시장성, 실현 가능성, 리스크 등을 분석합니다
              </p>
              <button
                type="button"
                onClick={() => createMutation.mutate()}
                className="rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-6 py-3 text-sm font-medium text-cold-cyan transition-all hover:bg-cold-cyan/20 hover:shadow-[0_0_20px_rgba(92,205,229,0.15)]"
              >
                감정 요청
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
