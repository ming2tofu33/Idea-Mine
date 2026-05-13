"use client";

import { use, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { LabBackground } from "@/components/backgrounds/lab-background";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ConfirmCostDialog } from "@/components/shared/confirm-cost-dialog";
import { ProgressSteps } from "@/components/shared/progress-steps";
import { SectionCard } from "@/components/shared/section-card";
import { labApi, vaultApi } from "@/lib/api";
import type { Overview } from "@/types/api";

const WORKFLOW_STEPS = ["Mine", "Vault", "Overview", "Appraisal", "Full Overview"];

const LOADING_MESSAGES = [
  "Reviewing the selected idea",
  "Mapping the user problem",
  "Scanning market context",
  "Drafting product features",
  "Defining MVP scope",
];

const FULL_OVERVIEW_MESSAGES = [
  "Expanding narrative structure",
  "Drafting product logic",
  "Outlining technical shape",
  "Finalizing the full document",
];

function TimedLoading({
  title,
  messages,
}: {
  title: string;
  messages: string[];
}) {
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => setElapsed((prev) => prev + 100), 100);
    const rotate = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 3500);
    return () => {
      clearInterval(tick);
      clearInterval(rotate);
    };
  }, [messages.length]);

  const progress = Math.min(92, 18 + elapsed / 550);

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      <div className="relative mb-6">
        <div className="h-4 w-4 rounded-full bg-cold-cyan/60 shadow-[0_0_20px_rgba(92,205,229,0.35)]" />
        <div className="absolute inset-0 animate-ping rounded-full bg-cold-cyan/20" />
      </div>
      <h3 className="mb-4 text-base font-semibold text-text-primary">{title}</h3>
      <div className="mb-4 h-1 w-64 overflow-hidden rounded-full bg-surface-2/40">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cold-cyan/40 via-cold-cyan/70 to-cold-cyan/40"
          style={{ width: `${progress}%`, transition: "width 0.3s ease-out" }}
        />
      </div>
      <p className="text-sm text-text-secondary">{messages[index]}</p>
      <p className="mt-2 text-[11px] text-text-secondary/30">
        {Math.floor(elapsed / 1000)}s elapsed
      </p>
    </div>
  );
}

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

function OverviewSections({ overview }: { overview: Overview }) {
  return (
    <div className="space-y-6">
      <SectionGroup label="Vision">
        <SectionCard title="Concept">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {overview.concept}
          </p>
        </SectionCard>
        <SectionCard title="Problem">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {overview.problem}
          </p>
        </SectionCard>
        <SectionCard title="Target user">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {overview.target}
          </p>
        </SectionCard>
      </SectionGroup>

      <SectionGroup label="Product" delay={0.08}>
        <SectionCard title="Core features">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {overview.features}
          </p>
        </SectionCard>
        <SectionCard title="Differentiator">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {overview.differentiator}
          </p>
        </SectionCard>
      </SectionGroup>

      <SectionGroup label="Business" delay={0.16}>
        <SectionCard title="Business model">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {overview.revenue}
          </p>
        </SectionCard>
        <SectionCard title="MVP scope">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {overview.mvp_scope}
          </p>
        </SectionCard>
      </SectionGroup>
    </div>
  );
}

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
    <div className="desktop-instrument-flat group rounded-lg opacity-65 transition-opacity hover:opacity-100">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span>{new Date(overview.created_at).toLocaleDateString("en-US")}</span>
          <span className="text-xs text-text-secondary/40">
            {expanded ? "Collapse" : "Expand"}
          </span>
        </button>

        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400">Delete version?</span>
            <button
              type="button"
              onClick={() => onDelete(overview.id)}
              disabled={isDeleting}
              className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-400/10"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="cursor-pointer rounded px-2 py-1 text-xs text-text-secondary transition-colors hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="cursor-pointer rounded p-1.5 text-text-secondary/30 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-400/10 hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {expanded && (
        <div className="border-t border-line-steel/10 px-4 py-4">
          <OverviewSections overview={overview} />
        </div>
      )}
    </div>
  );
}

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
    <div className="mt-8 border-t border-line-steel/15 pt-6">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex cursor-pointer items-center gap-2 text-sm font-medium text-text-secondary/60 transition-colors hover:text-text-primary"
      >
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        Previous versions ({overviews.length})
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

  const fullOverviewQuery = useQuery({
    queryKey: ["fullOverviews", overview.id],
    queryFn: () => labApi.getFullOverviewsByOverview(overview.id),
    enabled: !!overview.id,
  });

  const latestFullOverview = fullOverviewQuery.data?.[0] ?? null;

  const fullOverviewMutation = useMutation({
    mutationFn: () => labApi.createFullOverview(overview.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fullOverviews", overview.id] });
      router.push(`/lab/full/${overview.id}`);
    },
  });

  if (fullOverviewMutation.isPending) {
    return <TimedLoading title="Generating full overview" messages={FULL_OVERVIEW_MESSAGES} />;
  }

  if (fullOverviewMutation.isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-red-400">Failed to generate the full overview.</p>
        <p className="mt-1 text-xs text-text-secondary/60">
          {fullOverviewMutation.error instanceof Error
            ? fullOverviewMutation.error.message
            : "Unknown error"}
        </p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => fullOverviewMutation.mutate()}
            className="cursor-pointer rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all hover:bg-cold-cyan/20"
          >
            Retry
          </button>
          <button
            onClick={() => fullOverviewMutation.reset()}
            className="cursor-pointer rounded-lg border border-line-steel/30 bg-surface-2/50 px-5 py-2.5 text-sm text-text-secondary transition-all hover:text-text-primary"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OverviewSections overview={overview} />

      <div className="flex flex-wrap items-center gap-3 border-t border-line-steel/20 pt-4">
        <Link
          href={`/lab/appraisal/${overview.id}`}
          className="cursor-pointer rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all duration-200 hover:bg-cold-cyan/20 hover:shadow-[0_0_20px_rgba(92,205,229,0.1)]"
        >
          Open appraisal
        </Link>
        <ConfirmCostDialog
          action="overview"
          onConfirm={onRegenerate}
          isLoading={isRegenerating}
          label="Regenerate overview"
          message="Generate a fresh overview for this idea?"
        />
        {latestFullOverview ? (
          <Link
            href={`/lab/full/${overview.id}`}
            className="cursor-pointer rounded-lg border border-line-steel/30 bg-surface-2/50 px-5 py-2.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:border-cold-cyan/20 hover:text-text-primary"
          >
            Open full overview
          </Link>
        ) : (
          <ConfirmCostDialog
            action="overview"
            onConfirm={() => fullOverviewMutation.mutate()}
            isLoading={false}
            label="Generate full overview"
            message="Generate the expanded full overview document?"
          />
        )}
        <Link
          href={`/vault/${ideaId}`}
          className="cursor-pointer rounded-lg border border-line-steel/20 bg-transparent px-5 py-2.5 text-sm text-text-secondary/70 transition-colors duration-200 hover:text-text-primary"
        >
          Back to vault
        </Link>
      </div>
    </div>
  );
}

export default function LabOverviewPage({
  params,
}: {
  params: Promise<{ ideaId: string }>;
}) {
  const { ideaId } = use(params);
  const queryClient = useQueryClient();

  const ideaQuery = useQuery({
    queryKey: ["vaultedIdeas"],
    queryFn: vaultApi.getVaultedIdeas,
    select: (ideas) => ideas.find((idea) => idea.id === ideaId),
  });

  const overviewsQuery = useQuery({
    queryKey: ["overviews", ideaId],
    queryFn: () => vaultApi.getOverviewsByIdea(ideaId),
    enabled: !!ideaId,
  });

  const createMutation = useMutation({
    mutationFn: () => labApi.createOverview(ideaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overviews", ideaId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (overviewId: string) => vaultApi.deleteOverview(overviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overviews", ideaId] });
    },
  });

  const overviews = overviewsQuery.data ?? [];
  const latestOverview = overviews[0] ?? null;
  const olderOverviews = overviews.slice(1);
  const idea = ideaQuery.data;
  const isLoading = ideaQuery.isLoading || overviewsQuery.isLoading;

  return (
    <div className="relative flex min-h-0 flex-1">
      <LabBackground />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          <Breadcrumb
            items={[
              { label: "Lab", href: "/lab" },
              { label: "Overview" },
              ...(idea ? [{ label: idea.title }] : []),
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
              <p className="text-sm text-text-secondary">Idea not found.</p>
              <Link
                href="/vault"
                className="mt-4 cursor-pointer rounded-lg border border-line-steel bg-surface-2 px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary"
              >
                Back to vault
              </Link>
            </div>
          ) : (
            <>
              <ProgressSteps steps={WORKFLOW_STEPS} currentStep={2} />

              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  {idea.title}
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {idea.summary}
                </p>
              </div>

              {createMutation.isPending ? (
                <TimedLoading title="Generating overview" messages={LOADING_MESSAGES} />
              ) : createMutation.isError ? (
                <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-4 text-center">
                  <p className="text-sm text-red-400">Failed to generate the overview.</p>
                  <p className="mt-1 text-xs text-text-secondary/60">
                    {createMutation.error instanceof Error
                      ? createMutation.error.message
                      : "Unknown error"}
                  </p>
                  <button
                    type="button"
                    onClick={() => createMutation.mutate()}
                    className="mt-3 cursor-pointer rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all duration-200 hover:bg-cold-cyan/20"
                  >
                    Retry
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
                  {olderOverviews.length > 0 && (
                    <OlderOverviewsSection
                      overviews={olderOverviews}
                      onDelete={(id) => deleteMutation.mutate(id)}
                      isDeleting={deleteMutation.isPending}
                    />
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-line-steel/30 bg-surface-1/30 p-8 text-center backdrop-blur-sm">
                  <p className="mb-4 text-sm text-text-secondary">
                    Generate an AI-written overview for this idea.
                  </p>
                  <button
                    type="button"
                    onClick={() => createMutation.mutate()}
                    className="cursor-pointer rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-6 py-3 text-sm font-medium text-cold-cyan transition-all duration-200 hover:bg-cold-cyan/20 hover:shadow-[0_0_20px_rgba(92,205,229,0.15)]"
                  >
                    Generate overview
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
