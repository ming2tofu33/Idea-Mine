"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { VaultBackground } from "@/components/backgrounds/vault-background";
import { vaultApi } from "@/lib/api";
import type { Idea } from "@/types/api";

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
}: {
  idea: Idea;
  hasOverview: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="group rounded-xl border border-line-steel/30 bg-surface-1/50 p-5 backdrop-blur-sm transition-all duration-200 hover:border-cold-cyan/20 hover:bg-surface-1/70">
      <div className="mb-1 flex items-start justify-between gap-2">
        <Link
          href={`/vault/${idea.id}`}
          className="flex-1 text-base font-semibold text-text-primary transition-colors hover:text-cold-cyan"
        >
          {idea.title_ko}
        </Link>
        {hasOverview && (
          <span className="shrink-0 rounded-full border border-cold-cyan/30 bg-cold-cyan/10 px-2 py-0.5 text-[10px] font-medium text-cold-cyan">
            개요 완료
          </span>
        )}
      </div>

      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-text-secondary">
        {idea.summary_ko}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/lab/overview/${idea.id}`}
            className="text-xs text-cold-cyan/70 transition-colors hover:text-cold-cyan"
          >
            Lab으로 보내기
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {showConfirm ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onDelete(idea.id)}
                disabled={isDeleting}
                className="rounded px-2 py-0.5 text-xs text-red-400 transition-colors hover:bg-red-400/10"
              >
                {isDeleting ? "삭제 중..." : "확인"}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded px-2 py-0.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="rounded px-2 py-0.5 text-xs text-text-secondary/50 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
            >
              삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Page ---

export default function VaultPage() {
  const queryClient = useQueryClient();

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
          const overview = await vaultApi.getOverviewByIdea(idea.id);
          results[idea.id] = overview !== null;
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
        <div className="mx-auto mb-6 w-full max-w-4xl">
          <h2 className="text-xl font-bold text-text-primary">The Vault</h2>
          <p className="mt-1 text-sm text-text-secondary">
            채굴한 아이디어를 보관하고 관리하는 공간
          </p>
        </div>

        {/* Content */}
        <div className="mx-auto w-full max-w-4xl flex-1">
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
                금고를 불러오지 못했습니다
              </p>
              <p className="mt-1 text-xs text-text-secondary/60">
                {error instanceof Error ? error.message : "알 수 없는 오류"}
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
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 text-4xl opacity-30">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-text-secondary"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <p className="text-sm text-text-secondary">
                아직 금고에 저장된 아이디어가 없습니다
              </p>
              <Link
                href="/mine"
                className="mt-4 rounded-lg border border-line-steel bg-surface-2 px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-cold-cyan/30 hover:text-text-primary"
              >
                광산에서 채굴하기
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
