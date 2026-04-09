"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FlaskConical, Pickaxe, ArrowRight } from "lucide-react";
import { LabBackground } from "@/components/backgrounds/lab-background";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { vaultApi } from "@/lib/api";
import type { Idea, Overview } from "@/types/api";

// --- Skeleton ---

function SkeletonRow() {
  return (
    <div className="animate-pulse rounded-xl border border-line-steel/20 bg-surface-1/40 p-4">
      <div className="mb-2 h-4 w-2/3 rounded bg-surface-2/60" />
      <div className="h-3 w-1/3 rounded bg-surface-2/40" />
    </div>
  );
}

// --- Status badges ---

function StatusBadge({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <span
      className={[
        "rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors duration-200",
        active
          ? "border-cold-cyan/30 bg-cold-cyan/10 text-cold-cyan"
          : "border-line-steel/20 bg-surface-2/30 text-text-secondary/40",
      ].join(" ")}
    >
      {label}
    </span>
  );
}

// --- Idea row for "needs overview" ---

function IdeaRow({ idea }: { idea: Idea }) {
  return (
    <Link
      href={`/lab/collection/${idea.id}`}
      className="group flex cursor-pointer items-center justify-between rounded-xl border border-line-steel/20 bg-surface-1/40 p-4 transition-all duration-200 hover:border-cold-cyan/20 hover:bg-surface-1/60"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary transition-colors group-hover:text-cold-cyan">
          {idea.title_ko}
        </p>
        <p className="mt-0.5 truncate text-xs text-text-secondary">
          {idea.summary_ko}
        </p>
      </div>
      <div className="ml-4 flex shrink-0 items-center gap-2">
        <span className="text-xs font-medium text-cold-cyan/70 transition-colors group-hover:text-cold-cyan">
          개요 생성
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-cold-cyan/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-cold-cyan" />
      </div>
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
      href={`/lab/collection/${idea.id}`}
      className="group flex cursor-pointer items-center justify-between rounded-xl border border-line-steel/20 bg-surface-1/40 p-4 transition-all duration-200 hover:border-cold-cyan/20 hover:bg-surface-1/60"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary transition-colors group-hover:text-cold-cyan">
          {idea.title_ko}
        </p>
        <p className="mt-0.5 truncate text-xs text-text-secondary">
          {overview.concept_ko}
        </p>
      </div>
      <div className="ml-4 flex shrink-0 items-center gap-2">
        <StatusBadge label="개요" active />
      </div>
    </Link>
  );
}

// --- Section header ---

function SectionHeader({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <h3 className="text-sm font-semibold text-cold-cyan/80">{title}</h3>
      <span className="text-xs text-text-secondary/50">({count})</span>
    </div>
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
            eyebrow="LAB"
            title="The Lab"
            subtitle="Analyze and refine the ideas you've collected"
          />
        </div>

        <div className="mx-auto w-full max-w-5xl flex-1 space-y-8">
          {/* Section: Ideas needing overview */}
          <section className="space-y-3">
            <SectionHeader
              title="개요 대기"
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
                  <IdeaRow key={idea.id} idea={idea} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FlaskConical className="h-10 w-10" />}
                title={
                  ideas.length === 0
                    ? "아이디어가 없습니다"
                    : "모든 아이디어에 개요가 생성되었습니다"
                }
                description={
                  ideas.length === 0
                    ? "금고에 아이디어를 먼저 저장해주세요"
                    : "새로운 아이디어를 채굴해보세요"
                }
                action={
                  ideas.length === 0 ? (
                    <Link
                      href="/mine"
                      className="inline-flex cursor-pointer items-center gap-2 text-xs text-cold-cyan/70 transition-colors duration-200 hover:text-cold-cyan"
                    >
                      <Pickaxe className="h-3.5 w-3.5" />
                      광산으로 이동
                    </Link>
                  ) : undefined
                }
              />
            )}
          </section>

          {/* Section: Recent overviews — always show section, even if empty */}
          <section className="space-y-3">
            <SectionHeader
              title="최근 문서"
              count={ideasWithOverview.length}
            />
            {ideasWithOverview.length > 0 ? (
              <div className="space-y-2">
                {ideasWithOverview.map((idea) => (
                  <OverviewRow
                    key={idea.id}
                    idea={idea}
                    overview={overviewMap[idea.id]!}
                  />
                ))}
              </div>
            ) : !isLoading ? (
              <div className="rounded-xl border border-dashed border-line-steel/15 bg-surface-1/20 p-6 text-center">
                <p className="text-xs text-text-secondary/50">
                  아직 생성된 문서가 없습니다
                </p>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
