"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Lock, Pickaxe } from "lucide-react";
import { VaultBackground } from "@/components/backgrounds/vault-background";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SkeletonCard } from "@/components/vault/skeleton-card";
import { VaultIdeaCard } from "@/components/vault/vault-idea-card";
import { VAULT_LABELS, type VaultLanguage } from "@/components/vault/vault-labels";
import { useProfile } from "@/hooks/use-profile";
import { vaultApi } from "@/lib/api";

// --- Page ---

export function VaultClient() {
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
