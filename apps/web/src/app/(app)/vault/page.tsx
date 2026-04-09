"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Lock, Pickaxe, Trash2 } from "lucide-react";
import { VaultBackground } from "@/components/backgrounds/vault-background";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { VAULT_LABELS, type VaultLanguage } from "@/components/vault/vault-labels";
import { useProfile } from "@/hooks/use-profile";
import { vaultApi } from "@/lib/api";
import type { Idea } from "@/types/api";

// --- Progress dots for workflow status ---

function WorkflowDots({
  hasOverview,
  lang,
}: {
  hasOverview: boolean;
  lang: VaultLanguage;
}) {
  const current = hasOverview ? 1 : 0;
  const steps = [
    VAULT_LABELS.workflow.raw[lang],
    VAULT_LABELS.workflow.overview[lang],
    VAULT_LABELS.workflow.appraisal[lang],
    VAULT_LABELS.workflow.fullOverview[lang],
  ];

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-1">
          {i > 0 && (
            <div
              className={[
                "h-px w-2",
                i <= current ? "bg-cold-cyan/40" : "bg-line-steel/30",
              ].join(" ")}
            />
          )}
          <div
            title={step}
            className={[
              "h-1.5 w-1.5 rounded-full transition-colors duration-200",
              i < current
                ? "bg-cold-cyan/60"
                : i === current
                  ? "bg-cold-cyan"
                  : "bg-line-steel/30",
            ].join(" ")}
          />
        </div>
      ))}
      <span className="ml-1.5 text-[10px] text-text-secondary/60">
        {hasOverview
          ? VAULT_LABELS.overviewComplete[lang]
          : VAULT_LABELS.rawStone[lang]}
      </span>
    </div>
  );
}

// --- Skeleton ---

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-line-steel/20 bg-surface-1/40 p-5">
      <div className="mb-3 h-5 w-3/4 rounded bg-surface-2/60" />
      <div className="mb-2 h-4 w-full rounded bg-surface-2/40" />
      <div className="mb-4 h-4 w-2/3 rounded bg-surface-2/40" />
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 rounded bg-surface-2/40" />
        <div className="h-3 w-16 rounded bg-surface-2/40" />
      </div>
    </div>
  );
}

// --- Idea Card ---

function VaultIdeaCard({
  idea,
  hasOverview,
  onDelete,
  isDeleting,
  lang,
}: {
  idea: Idea;
  hasOverview: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  lang: VaultLanguage;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const title = lang === "en" && idea.title_en ? idea.title_en : idea.title_ko;
  const summary = lang === "en" && idea.summary_en ? idea.summary_en : idea.summary_ko;

  return (
    <Link
      href={`/vault/${idea.id}`}
      className="group relative flex cursor-pointer flex-col rounded-xl border border-line-steel/30 bg-surface-1/50 p-5 backdrop-blur-sm transition-all duration-200 hover:border-cold-cyan/20 hover:bg-surface-1/70 motion-safe:hover:-translate-y-0.5"
    >
      {/* Delete button — top-right, hover-visible */}
      <div
        className="absolute right-3 top-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        onClick={(e) => e.preventDefault()}
      >
        {confirmDelete ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(idea.id);
            }}
            disabled={isDeleting}
            className="cursor-pointer rounded px-2 py-1 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? VAULT_LABELS.deleting[lang] : VAULT_LABELS.deleteConfirm[lang]}
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setConfirmDelete(true);
              setTimeout(() => setConfirmDelete(false), 3000);
            }}
            className="cursor-pointer rounded p-1 text-text-secondary/40 transition-colors hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-1 pr-8 text-base font-semibold text-text-primary transition-colors group-hover:text-cold-cyan">
        {title}
      </h3>

      {/* Summary */}
      <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-text-secondary">
        {summary}
      </p>

      {/* Bottom: workflow progress */}
      <WorkflowDots hasOverview={hasOverview} lang={lang} />
    </Link>
  );
}

// --- Page ---

export default function VaultPage() {
  const queryClient = useQueryClient();
  const { profile } = useProfile();
  const lang: VaultLanguage = (profile?.language ?? "ko") as VaultLanguage;

  const {
    data: ideas,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["vaultedIdeas"],
    queryFn: vaultApi.getVaultedIdeas,
  });

  // Check which ideas have overviews
  const overviewQueries = useQuery({
    queryKey: ["vaultOverviewCheck", ideas?.map((i) => i.id)],
    queryFn: async () => {
      if (!ideas) return {};
      const results: Record<string, boolean> = {};
      await Promise.all(
        ideas.map(async (idea) => {
          const overviews = await vaultApi.getOverviewsByIdea(idea.id);
          results[idea.id] = overviews.length > 0;
        }),
      );
      return results;
    },
    enabled: !!ideas && ideas.length > 0,
  });

  const deleteMutation = useMutation({
    mutationFn: vaultApi.deleteIdea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaultedIdeas"] });
    },
  });

  const hasOverviewMap = overviewQueries.data ?? {};

  return (
    <div className="relative flex min-h-0 flex-1">
      <VaultBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-6 w-full max-w-5xl">
          <PageHeader
            eyebrow={VAULT_LABELS.eyebrow[lang]}
            title={VAULT_LABELS.title[lang]}
            subtitle={VAULT_LABELS.subtitle[lang]}
            meta={
              ideas && ideas.length > 0 ? (
                <span className="rounded-md border border-line-steel/40 bg-surface-1/50 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-text-secondary">
                  {VAULT_LABELS.ideasCount[lang](ideas.length)}
                </span>
              ) : undefined
            }
          />
        </div>

        {/* Content */}
        <div className="mx-auto w-full max-w-5xl flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-text-secondary">
                {VAULT_LABELS.loadFailed[lang]}
              </p>
              <p className="mt-1 text-xs text-text-secondary/60">
                {error instanceof Error ? error.message : VAULT_LABELS.unknownError[lang]}
              </p>
            </div>
          ) : ideas && ideas.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ideas.map((idea) => (
                <VaultIdeaCard
                  key={idea.id}
                  idea={idea}
                  hasOverview={hasOverviewMap[idea.id] ?? false}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  isDeleting={deleteMutation.isPending}
                  lang={lang}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Lock className="h-12 w-12" />}
              title={VAULT_LABELS.emptyTitle[lang]}
              description={VAULT_LABELS.emptyHint[lang]}
              action={
                <Link
                  href="/mine"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line-steel bg-surface-2 px-5 py-2.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:border-cold-cyan/30 hover:text-text-primary"
                >
                  <Pickaxe className="h-4 w-4" />
                  {VAULT_LABELS.goToMine[lang]}
                </Link>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
