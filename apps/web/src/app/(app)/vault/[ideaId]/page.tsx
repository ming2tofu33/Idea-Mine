"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { VaultBackground } from "@/components/backgrounds/vault-background";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ProgressSteps } from "@/components/shared/progress-steps";
import { SectionCard } from "@/components/shared/section-card";
import { KeywordChip } from "@/components/mine/keyword-chip";
import { vaultApi } from "@/lib/api";

// --- Section group ---

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

// --- Page ---

const WORKFLOW_STEPS = ["Mine", "Vault", "개요", "감정", "풀 개요"];

export default function VaultDetailPage({
  params,
}: {
  params: Promise<{ ideaId: string }>;
}) {
  const { ideaId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  // Determine workflow position
  const currentStep = overview ? 2 : 1; // 0=Mine, 1=Vault, 2=개요, 3=감정, 4=풀개요

  return (
    <div className="relative flex min-h-0 flex-1">
      <VaultBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Vault", href: "/vault" },
              { label: idea?.title_ko ?? "..." },
            ]}
          />

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
                className="mt-4 cursor-pointer rounded-lg border border-line-steel bg-surface-2 px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary"
              >
                금고로 돌아가기
              </Link>
            </div>
          ) : (
            <>
              {/* Progress steps */}
              <ProgressSteps steps={WORKFLOW_STEPS} currentStep={currentStep} />

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
                          category: kw.category as
                            | "ai"
                            | "who"
                            | "domain"
                            | "tech"
                            | "value"
                            | "money",
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
                <div className="space-y-6">
                  <SectionGroup label="Vision" delay={0}>
                    <SectionCard title="컨셉">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                        {overview.concept_ko}
                      </p>
                    </SectionCard>
                    <SectionCard title="문제 정의">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                        {overview.problem_ko}
                      </p>
                    </SectionCard>
                    <SectionCard title="타깃 사용자">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                        {overview.target_ko}
                      </p>
                    </SectionCard>
                  </SectionGroup>

                  <SectionGroup label="Product" delay={0.1}>
                    <SectionCard title="핵심 기능">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                        {overview.features_ko}
                      </p>
                    </SectionCard>
                    <SectionCard title="차별점">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                        {overview.differentiator_ko}
                      </p>
                    </SectionCard>
                  </SectionGroup>

                  <SectionGroup label="Business" delay={0.2}>
                    <SectionCard title="수익 모델">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                        {overview.revenue_ko}
                      </p>
                    </SectionCard>
                    <SectionCard title="MVP 범위">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                        {overview.mvp_scope_ko}
                      </p>
                    </SectionCard>
                  </SectionGroup>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-line-steel/30 bg-surface-1/30 p-6 text-center">
                  <p className="mb-3 text-sm text-text-secondary">
                    아직 개요가 생성되지 않았습니다
                  </p>
                  <Link
                    href={`/lab/overview/${ideaId}`}
                    className="inline-block cursor-pointer rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all duration-200 hover:bg-cold-cyan/20"
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
                      className="cursor-pointer rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all duration-200 hover:bg-cold-cyan/20"
                    >
                      감정 보기
                    </Link>
                    <Link
                      href={`/lab/overview/${ideaId}`}
                      className="cursor-pointer rounded-lg border border-line-steel/30 bg-surface-2/50 px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary"
                    >
                      개요 보기
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`/lab/overview/${ideaId}`}
                    className="cursor-pointer rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all duration-200 hover:bg-cold-cyan/20"
                  >
                    개요 생성하기
                  </Link>
                )}

                <div className="flex-1" />

                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary">
                      정말 삭제할까요?
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                      className="cursor-pointer rounded px-3 py-1.5 text-xs text-red-400 transition-colors duration-200 hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? "삭제 중..." : "삭제"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="cursor-pointer rounded px-3 py-1.5 text-xs text-text-secondary transition-colors duration-200 hover:text-text-primary"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="cursor-pointer rounded p-2 text-text-secondary/40 transition-colors duration-200 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
