"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Target,
  Wrench,
  Sparkles,
  Expand,
  AlertTriangle,
  Info,
} from "lucide-react";
import { LabBackground } from "@/components/backgrounds/lab-background";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ConfirmCostDialog } from "@/components/shared/confirm-cost-dialog";
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

// --- Depth badge ---

const DEPTH_LABELS: Record<string, { label: string; desc: string }> = {
  basic_free: { label: "기본 감정", desc: "3축 분석 (시장, 실현, 리스크)" },
  basic: { label: "기본 감정", desc: "3축 분석" },
  precise_lite: { label: "정밀 감정 Lite", desc: "5축 분석" },
  precise_pro: { label: "정밀 감정 Pro", desc: "6축 분석 + 상세 리포트" },
};

function DepthBadge({ depth }: { depth: string }) {
  const info = DEPTH_LABELS[depth] ?? { label: depth, desc: "" };

  return (
    <div className="flex items-center gap-2">
      <span className="rounded-full border border-cold-cyan/30 bg-cold-cyan/10 px-2.5 py-0.5 text-[10px] font-medium text-cold-cyan">
        {info.label}
      </span>
      {info.desc && (
        <span className="flex items-center gap-1 text-[11px] text-text-secondary/50">
          <Info className="h-3 w-3" />
          {info.desc}
        </span>
      )}
    </div>
  );
}

// --- Dimension card ---

const DIMENSION_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; critical?: boolean }
> = {
  market_fit: {
    label: "시장 적합성",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  problem_fit: {
    label: "문제 적합성",
    icon: <Target className="h-4 w-4" />,
  },
  feasibility: {
    label: "실현 가능성",
    icon: <Wrench className="h-4 w-4" />,
    critical: true,
  },
  differentiation: {
    label: "차별화",
    icon: <Sparkles className="h-4 w-4" />,
  },
  scalability: {
    label: "확장성",
    icon: <Expand className="h-4 w-4" />,
  },
  risk: {
    label: "리스크",
    icon: <AlertTriangle className="h-4 w-4" />,
    critical: true,
  },
};

function DimensionCard({
  dimension,
  content,
  index,
}: {
  dimension: string;
  content: string;
  index: number;
}) {
  const config = DIMENSION_CONFIG[dimension] ?? {
    label: dimension,
    icon: null,
    critical: false,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className={[
        "rounded-xl border bg-surface-1/50 p-5 backdrop-blur-sm transition-colors duration-200",
        config.critical
          ? "border-cold-cyan/25"
          : "border-line-steel/20",
      ].join(" ")}
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className={
            config.critical ? "text-cold-cyan/80" : "text-text-secondary/50"
          }
        >
          {config.icon}
        </span>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-cold-cyan/70">
          {config.label}
        </h4>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
        {content}
      </p>
    </motion.div>
  );
}

// --- Appraisal display ---

function AppraisalDisplay({
  appraisal,
  isLatest,
}: {
  appraisal: Appraisal;
  isLatest: boolean;
}) {
  const [expanded, setExpanded] = useState(isLatest);

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
      <div className="flex items-center justify-between">
        <DepthBadge depth={appraisal.depth} />
        {!isLatest && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="cursor-pointer text-[11px] text-text-secondary/50 transition-colors duration-200 hover:text-text-primary"
          >
            {expanded ? "접기" : "펼치기"}
          </button>
        )}
      </div>

      {expanded && (
        <div className="grid gap-3">
          {dimensions.map((dim, i) => (
            <DimensionCard
              key={dim.key}
              dimension={dim.key}
              content={dim.content}
              index={i}
            />
          ))}
        </div>
      )}
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

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[{ label: "Lab", href: "/lab" }, { label: "감정" }]}
          />

          {/* Header */}
          <div>
            <h2 className="text-xl font-bold text-text-primary">감정 결과</h2>
            <p className="mt-1 text-sm text-text-secondary">
              AI가 아이디어의 잠재력을 다양한 차원에서 분석합니다
            </p>
          </div>

          {/* Content */}
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
              <ConfirmCostDialog
                action="overview"
                onConfirm={() => createMutation.mutate()}
                isLoading={createMutation.isPending}
                label="다시 시도"
                message="감정을 다시 요청하시겠습니까?"
              />
            </div>
          ) : hasAppraisals ? (
            <div className="space-y-8">
              {appraisals.map((appraisal, i) => (
                <AppraisalDisplay
                  key={appraisal.id}
                  appraisal={appraisal}
                  isLatest={i === 0}
                />
              ))}

              {/* Request another appraisal */}
              <div className="border-t border-line-steel/20 pt-4">
                <ConfirmCostDialog
                  action="overview"
                  onConfirm={() => createMutation.mutate()}
                  isLoading={createMutation.isPending}
                  label="재감정"
                  message="감정을 재요청하시겠습니까?"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-line-steel/30 bg-surface-1/30 p-8 text-center">
              <p className="mb-4 text-sm text-text-secondary">
                AI가 아이디어의 시장성, 실현 가능성, 리스크 등을 분석합니다
              </p>
              <ConfirmCostDialog
                action="overview"
                onConfirm={() => createMutation.mutate()}
                isLoading={createMutation.isPending}
                label="감정 요청"
                message="감정을 요청하시겠습니까?"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
