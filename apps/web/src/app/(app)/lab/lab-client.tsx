"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FlaskConical, Pickaxe } from "lucide-react";
import { LabBackground } from "@/components/backgrounds/lab-background";
import { IdeaRow } from "@/components/lab/idea-row";
import { LAB_LABELS, type LabLanguage } from "@/components/lab/lab-labels";
import { OverviewRow } from "@/components/lab/overview-row";
import { SectionHeader } from "@/components/lab/section-header";
import { SkeletonRow } from "@/components/lab/skeleton-row";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { useProfile } from "@/hooks/use-profile";
import { vaultApi } from "@/lib/api";
import type { Overview } from "@/types/api";

// --- Page ---

export function LabClient() {
  const { profile } = useProfile();
  const lang: LabLanguage = (profile?.language ?? "ko") as LabLanguage;

  // Load all vaulted ideas
  const ideasQuery = useQuery({
    queryKey: ["vaultedIdeas"],
    queryFn: vaultApi.getVaultedIdeas,
  });

  // Check overviews for each idea
  const overviewsQuery = useQuery({
    queryKey: [
      "labOverviews",
      ideasQuery.data?.map((i) => i.id),
    ],
    queryFn: async () => {
      if (!ideasQuery.data) return {};
      const results: Record<string, Overview | null> = {};
      await Promise.all(
        ideasQuery.data.map(async (idea) => {
          const overviews = await vaultApi.getOverviewsByIdea(idea.id);
          results[idea.id] = overviews[0] ?? null;
        }),
      );
      return results;
    },
    enabled: !!ideasQuery.data && ideasQuery.data.length > 0,
  });

  const ideas = ideasQuery.data ?? [];
  const overviewMap = overviewsQuery.data ?? {};
  const isLoading = ideasQuery.isLoading;

  const ideasWithoutOverview = ideas.filter(
    (idea) => !overviewMap[idea.id],
  );
  const ideasWithOverview = ideas.filter(
    (idea) => overviewMap[idea.id],
  );

  return (
    <div className="relative flex min-h-0 flex-1">
      <LabBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-6 w-full max-w-5xl">
          <PageHeader
            eyebrow={LAB_LABELS.eyebrow[lang]}
            title={LAB_LABELS.title[lang]}
            subtitle={LAB_LABELS.subtitle[lang]}
          />
        </div>

        <div className="mx-auto w-full max-w-5xl flex-1 space-y-8">
          {/* Section: Ideas needing overview */}
          <section className="space-y-3">
            <SectionHeader
              title={LAB_LABELS.pendingOverview[lang]}
              count={isLoading ? 0 : ideasWithoutOverview.length}
            />
            {isLoading ? (
              <div className="space-y-2">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : ideasWithoutOverview.length > 0 ? (
              <div className="space-y-2">
                {ideasWithoutOverview.map((idea) => (
                  <IdeaRow key={idea.id} idea={idea} lang={lang} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FlaskConical className="h-10 w-10" />}
                title={
                  ideas.length === 0
                    ? LAB_LABELS.noIdeasTitle[lang]
                    : LAB_LABELS.allOverviewsTitle[lang]
                }
                description={
                  ideas.length === 0
                    ? LAB_LABELS.noIdeasDesc[lang]
                    : LAB_LABELS.newIdeasDesc[lang]
                }
                action={
                  ideas.length === 0 ? (
                    <Link
                      href="/mine"
                      className="inline-flex cursor-pointer items-center gap-2 text-xs text-cold-cyan/70 transition-colors duration-200 hover:text-cold-cyan"
                    >
                      <Pickaxe className="h-3.5 w-3.5" />
                      {LAB_LABELS.goToMine[lang]}
                    </Link>
                  ) : undefined
                }
              />
            )}
          </section>

          {/* Section: Recent overviews — always show section, even if empty */}
          <section className="space-y-3">
            <SectionHeader
              title={LAB_LABELS.recentDocuments[lang]}
              count={ideasWithOverview.length}
            />
            {ideasWithOverview.length > 0 ? (
              <div className="space-y-2">
                {ideasWithOverview.map((idea) => (
                  <OverviewRow
                    key={idea.id}
                    idea={idea}
                    overview={overviewMap[idea.id]!}
                    lang={lang}
                  />
                ))}
              </div>
            ) : !isLoading ? (
              <div className="rounded-xl border border-dashed border-line-steel/15 bg-surface-1/20 p-6 text-center">
                <p className="text-xs text-text-secondary/50">
                  {LAB_LABELS.noDocumentsYet[lang]}
                </p>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
