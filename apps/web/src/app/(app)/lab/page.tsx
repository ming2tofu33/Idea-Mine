"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { LabBackground } from "@/components/backgrounds/lab-background";
import { vaultApi } from "@/lib/api";
import type { Idea, Overview } from "@/types/api";

// --- Skeleton ---

function SkeletonRow() {
  return (
    <div className="animate-pulse rounded-lg border border-line-steel/20 bg-surface-1/40 p-4">
      <div className="mb-2 h-4 w-2/3 rounded bg-surface-2/60" />
      <div className="h-3 w-1/3 rounded bg-surface-2/40" />
    </div>
  );
}

// --- Idea row for "needs overview" ---

function IdeaRow({ idea }: { idea: Idea }) {
  return (
    <Link
      href={`/lab/overview/${idea.id}`}
      className="flex items-center justify-between rounded-lg border border-line-steel/20 bg-surface-1/40 p-4 transition-all duration-200 hover:border-cold-cyan/20 hover:bg-surface-1/60"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {idea.title_ko}
        </p>
        <p className="mt-0.5 truncate text-xs text-text-secondary">
          {idea.summary_ko}
        </p>
      </div>
      <span className="ml-4 shrink-0 text-xs text-cold-cyan/70">
        개요 생성
      </span>
    </Link>
  );
}

// --- Overview row ---

function OverviewRow({
  idea,
  overview,
}: {
  idea: Idea;
  overview: Overview;
}) {
  return (
    <Link
      href={`/lab/overview/${idea.id}`}
      className="flex items-center justify-between rounded-lg border border-line-steel/20 bg-surface-1/40 p-4 transition-all duration-200 hover:border-cold-cyan/20 hover:bg-surface-1/60"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {idea.title_ko}
        </p>
        <p className="mt-0.5 truncate text-xs text-text-secondary">
          {overview.concept_ko}
        </p>
      </div>
      <div className="ml-4 flex shrink-0 items-center gap-2">
        <span className="rounded-full border border-cold-cyan/30 bg-cold-cyan/10 px-2 py-0.5 text-[10px] font-medium text-cold-cyan">
          개요 완료
        </span>
      </div>
    </Link>
  );
}

// --- Page ---

export default function LabPage() {
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
          results[idea.id] = await vaultApi.getOverviewByIdea(idea.id);
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
        <div className="mx-auto mb-8 w-full max-w-2xl">
          <h2 className="text-xl font-bold text-text-primary">The Lab</h2>
          <p className="mt-1 text-sm text-text-secondary">
            아이디어를 분석하고 정제하는 공간
          </p>
        </div>

        <div className="mx-auto w-full max-w-2xl flex-1 space-y-8">
          {/* Section: Ideas needing overview */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-cold-cyan/80">
              개요 생성 대기
            </h3>
            {isLoading ? (
              <div className="space-y-2">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : ideasWithoutOverview.length > 0 ? (
              <div className="space-y-2">
                {ideasWithoutOverview.map((idea) => (
                  <IdeaRow key={idea.id} idea={idea} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-line-steel/20 bg-surface-1/20 p-6 text-center">
                <p className="text-xs text-text-secondary">
                  {ideas.length === 0
                    ? "금고에 아이디어를 먼저 저장해주세요"
                    : "모든 아이디어에 개요가 생성되었습니다"}
                </p>
                {ideas.length === 0 && (
                  <Link
                    href="/mine"
                    className="mt-3 inline-block text-xs text-cold-cyan/70 transition-colors hover:text-cold-cyan"
                  >
                    광산으로 이동
                  </Link>
                )}
              </div>
            )}
          </section>

          {/* Section: Recent overviews */}
          {ideasWithOverview.length > 0 && (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-cold-cyan/80">
                최근 문서
              </h3>
              <div className="space-y-2">
                {ideasWithOverview.map((idea) => (
                  <OverviewRow
                    key={idea.id}
                    idea={idea}
                    overview={overviewMap[idea.id]!}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
