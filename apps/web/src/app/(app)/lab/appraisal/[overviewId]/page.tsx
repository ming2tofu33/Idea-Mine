"use client";

import { use, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Expand,
  Info,
  Sparkles,
  Target,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { motion } from "framer-motion";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ConfirmCostDialog } from "@/components/shared/confirm-cost-dialog";
import { LabBackground } from "@/components/backgrounds/lab-background";
import { labApi } from "@/lib/api";
import type { Appraisal } from "@/types/api";

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
      <p className="text-sm text-text-secondary">Evaluating the idea{dots}</p>
    </div>
  );
}

const DEPTH_LABELS: Record<string, { label: string; desc: string }> = {
  basic_free: { label: "Basic", desc: "3 dimensions" },
  basic: { label: "Basic", desc: "6 dimensions" },
  precise_lite: { label: "Precise Lite", desc: "6 dimensions with tighter analysis" },
  precise_pro: { label: "Precise Pro", desc: "6 dimensions with full depth" },
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

const DIMENSION_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; critical?: boolean }
> = {
  market_fit: {
    label: "Market fit",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  problem_fit: {
    label: "Problem fit",
    icon: <Target className="h-4 w-4" />,
  },
  feasibility: {
    label: "Feasibility",
    icon: <Wrench className="h-4 w-4" />,
    critical: true,
  },
  differentiation: {
    label: "Differentiation",
    icon: <Sparkles className="h-4 w-4" />,
  },
  scalability: {
    label: "Scalability",
    icon: <Expand className="h-4 w-4" />,
  },
  risk: {
    label: "Risk",
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
        "desktop-instrument-flat rounded-xl p-5 transition-colors duration-200",
        config.critical ? "border-cold-cyan/25" : "border-line-steel/20",
      ].join(" ")}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className={config.critical ? "text-cold-cyan/80" : "text-text-secondary/50"}>
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

function AppraisalDisplay({
  appraisal,
  isLatest,
}: {
  appraisal: Appraisal;
  isLatest: boolean;
}) {
  const [expanded, setExpanded] = useState(isLatest);

  const dimensions: { key: string; content: string }[] = [
    { key: "market_fit", content: appraisal.market_fit },
    ...(appraisal.problem_fit ? [{ key: "problem_fit", content: appraisal.problem_fit }] : []),
    { key: "feasibility", content: appraisal.feasibility },
    ...(appraisal.differentiation
      ? [{ key: "differentiation", content: appraisal.differentiation }]
      : []),
    ...(appraisal.scalability ? [{ key: "scalability", content: appraisal.scalability }] : []),
    { key: "risk", content: appraisal.risk },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <DepthBadge depth={appraisal.depth} />
        {!isLatest && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="cursor-pointer text-[11px] text-text-secondary/50 transition-colors duration-200 hover:text-text-primary"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        )}
      </div>

      {expanded && (
        <div className="grid gap-3">
          {dimensions.map((dim, index) => (
            <DimensionCard
              key={dim.key}
              dimension={dim.key}
              content={dim.content}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function LabAppraisalPage({
  params,
}: {
  params: Promise<{ overviewId: string }>;
}) {
  const { overviewId } = use(params);
  const queryClient = useQueryClient();

  const appraisalsQuery = useQuery({
    queryKey: ["appraisals", overviewId],
    queryFn: () => labApi.getAppraisalsByOverview(overviewId),
    enabled: !!overviewId,
  });

  const createMutation = useMutation({
    mutationFn: () => labApi.createAppraisal(overviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisals", overviewId] });
    },
  });

  const appraisals = appraisalsQuery.data ?? [];
  const hasAppraisals = appraisals.length > 0;

  return (
    <div className="relative flex min-h-0 flex-1">
      <LabBackground />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          <Breadcrumb items={[{ label: "Lab", href: "/lab" }, { label: "Appraisal" }]} />

          <div>
            <h2 className="text-xl font-bold text-text-primary">Appraisal</h2>
            <p className="mt-1 text-sm text-text-secondary">
              AI evaluates market fit, feasibility, differentiation, and risk.
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
              <p className="text-sm text-red-400">Failed to generate the appraisal.</p>
              <p className="mt-1 text-xs text-text-secondary/60">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : "Unknown error"}
              </p>
              <ConfirmCostDialog
                action="overview"
                onConfirm={() => createMutation.mutate()}
                isLoading={createMutation.isPending}
                label="Retry"
                message="Request the appraisal again?"
              />
            </div>
          ) : hasAppraisals ? (
            <div className="space-y-8">
              {appraisals.map((appraisal, index) => (
                <AppraisalDisplay
                  key={appraisal.id}
                  appraisal={appraisal}
                  isLatest={index === 0}
                />
              ))}

              <div className="border-t border-line-steel/20 pt-4">
                <ConfirmCostDialog
                  action="overview"
                  onConfirm={() => createMutation.mutate()}
                  isLoading={createMutation.isPending}
                  label="Run another appraisal"
                  message="Generate another appraisal pass for this overview?"
                />
              </div>
            </div>
          ) : (
            <div className="desktop-instrument-flat rounded-xl border-dashed p-8 text-center">
              <p className="mb-4 text-sm text-text-secondary">
                Generate an appraisal to pressure-test the idea before you build.
              </p>
              <ConfirmCostDialog
                action="overview"
                onConfirm={() => createMutation.mutate()}
                isLoading={createMutation.isPending}
                label="Generate appraisal"
                message="Generate an appraisal for this overview?"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
