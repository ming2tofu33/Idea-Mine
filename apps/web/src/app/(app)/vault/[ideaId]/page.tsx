"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VaultBackground } from "@/components/backgrounds/vault-background";
import { KeywordChip } from "@/components/mine/keyword-chip";
import { vaultApi } from "@/lib/api";

// --- Section Card ---

function OverviewSection({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div className="rounded-lg border border-line-steel/20 bg-surface-1/40 p-4">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-cold-cyan/80">
        {title}
      </h4>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
        {content}
      </p>
    </div>
  );
}

// --- Page ---

export default function VaultDetailPage({
  params,
}: {
  params: Promise<{ ideaId: string }>;
}) {
  const { ideaId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load the idea
  const ideaQuery = useQuery({
    queryKey: ["vaultedIdeas"],
    queryFn: vaultApi.getVaultedIdeas,
    select: (ideas) => ideas.find((i) => i.id === ideaId),
  });

  // Load overview
  const overviewQuery = useQuery({
    queryKey: ["overview", ideaId],
    queryFn: () => vaultApi.getOverviewByIdea(ideaId),
    enabled: !!ideaId,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => vaultApi.deleteIdea(ideaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaultedIdeas"] });
      router.push("/vault");
    },
  });

  const idea = ideaQuery.data;
  const overview = overviewQuery.data;
  const isLoading = ideaQuery.isLoading || overviewQuery.isLoading;

  return (
    <div className="relative flex min-h-0 flex-1">
      <VaultBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Back link */}
        <div className="mx-auto mb-6 w-full max-w-2xl">
          <Link
            href="/vault"
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
            금고로 돌아가기
          </Link>
        </div>

        {/* Content */}
        <div className="mx-auto w-full max-w-2xl flex-1">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-7 w-2/3 rounded bg-surface-2/60" />
              <div className="h-4 w-full rounded bg-surface-2/40" />
              <div className="h-4 w-3/4 rounded bg-surface-2/40" />
              <div className="mt-6 grid gap-4">
                <div className="h-24 rounded-lg bg-surface-2/30" />
                <div className="h-24 rounded-lg bg-surface-2/30" />
              </div>
            </div>
          ) : !idea ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-text-secondary">
                아이디어를 찾을 수 없습니다
              </p>
              <Link
                href="/vault"
                className="mt-4 rounded-lg border border-line-steel bg-surface-2 px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                금고로 돌아가기
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Idea header */}
              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  {idea.title_ko}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {idea.summary_ko}
                </p>

                {/* Keywords */}
                {idea.keyword_combo && idea.keyword_combo.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {idea.keyword_combo.map((kw) => (
                      <KeywordChip
                        key={kw.slug}
                        keyword={{
                          id: kw.slug,
                          slug: kw.slug,
                          category: kw.category as "ai" | "who" | "domain" | "tech" | "value" | "money",
                          ko: kw.ko,
                          en: kw.en,
                          is_premium: false,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Overview sections */}
              {overview ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-text-primary">
                    개요
                  </h3>
                  <div className="grid gap-3">
                    <OverviewSection
                      title="컨셉"
                      content={overview.concept_ko}
                    />
                    <OverviewSection
                      title="문제 정의"
                      content={overview.problem_ko}
                    />
                    <OverviewSection
                      title="타깃 사용자"
                      content={overview.target_ko}
                    />
                    <OverviewSection
                      title="핵심 기능"
                      content={overview.features_ko}
                    />
                    <OverviewSection
                      title="차별점"
                      content={overview.differentiator_ko}
                    />
                    <OverviewSection
                      title="수익 모델"
                      content={overview.revenue_ko}
                    />
                    <OverviewSection
                      title="MVP 범위"
                      content={overview.mvp_scope_ko}
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-line-steel/30 bg-surface-1/30 p-6 text-center">
                  <p className="mb-3 text-sm text-text-secondary">
                    아직 개요가 생성되지 않았습니다
                  </p>
                  <Link
                    href={`/lab/overview/${ideaId}`}
                    className="inline-block rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all hover:bg-cold-cyan/20"
                  >
                    개요 생성하기
                  </Link>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 border-t border-line-steel/20 pt-4">
                {overview ? (
                  <>
                    <Link
                      href={`/lab/appraisal/${overview.id}`}
                      className="rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all hover:bg-cold-cyan/20"
                    >
                      감정 보기
                    </Link>
                    <Link
                      href={`/lab/overview/${ideaId}`}
                      className="rounded-lg border border-line-steel/30 bg-surface-2/50 px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
                    >
                      개요 보기
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`/lab/overview/${ideaId}`}
                    className="rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all hover:bg-cold-cyan/20"
                  >
                    개요 생성하기
                  </Link>
                )}

                <div className="flex-1" />

                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary">
                      정말 삭제하시겠습니까?
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                      className="rounded px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-400/10"
                    >
                      {deleteMutation.isPending ? "삭제 중..." : "삭제"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="rounded px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="rounded px-3 py-1.5 text-xs text-text-secondary/60 transition-colors hover:text-red-400"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
