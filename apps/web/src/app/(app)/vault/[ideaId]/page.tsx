"use client";

import { use, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

const WORKFLOW_STEPS = ["Mine", "Vault", "Overview", "Appraisal", "Full Overview"];

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

export default function VaultDetailPage({
  params,
}: {
  params: Promise<{ ideaId: string }>;
}) {
  const { ideaId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const ideaQuery = useQuery({
    queryKey: ["vaultedIdeas"],
    queryFn: vaultApi.getVaultedIdeas,
    select: (ideas) => ideas.find((idea) => idea.id === ideaId),
  });

  const overviewQuery = useQuery({
    queryKey: ["overviews", ideaId],
    queryFn: async () => {
      const overviews = await vaultApi.getOverviewsByIdea(ideaId);
      return overviews[0] ?? null;
    },
    enabled: !!ideaId,
  });

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
  const currentStep = overview ? 2 : 1;

  return (
    <div className="relative flex min-h-0 flex-1">
      <VaultBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          <Breadcrumb
            items={[
              { label: "Vault", href: "/vault" },
              { label: idea?.title || "..." },
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
              <ProgressSteps steps={WORKFLOW_STEPS} currentStep={currentStep} />

              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  {idea.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {idea.summary}
                </p>

                {idea.keyword_combo && idea.keyword_combo.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {idea.keyword_combo.map((keyword) => (
                      <KeywordChip
                        key={keyword.slug}
                        keyword={{
                          id: keyword.slug,
                          slug: keyword.slug,
                          category: keyword.category as
                            | "ai"
                            | "who"
                            | "domain"
                            | "tech"
                            | "value"
                            | "money",
                          label: keyword.label,
                          is_premium: false,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {overview ? (
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

                  <SectionGroup label="Product" delay={0.1}>
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

                  <SectionGroup label="Business" delay={0.2}>
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
              ) : (
                <div className="desktop-instrument-flat rounded-xl border-dashed p-6 text-center">
                  <p className="mb-3 text-sm text-text-secondary">
                    No overview has been generated yet.
                  </p>
                  <Link
                    href={`/lab/overview/${ideaId}`}
                    className="inline-block cursor-pointer rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all duration-200 hover:bg-cold-cyan/20"
                  >
                    Generate overview
                  </Link>
                </div>
              )}

              <div className="flex items-center gap-3 border-t border-line-steel/20 pt-4">
                {overview ? (
                  <>
                    <Link
                      href={`/lab/appraisal/${overview.id}`}
                      className="cursor-pointer rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all duration-200 hover:bg-cold-cyan/20"
                    >
                      Open appraisal
                    </Link>
                    <Link
                      href={`/lab/overview/${ideaId}`}
                      className="cursor-pointer rounded-lg border border-line-steel/30 bg-surface-2/50 px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary"
                    >
                      Open overview
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`/lab/overview/${ideaId}`}
                    className="cursor-pointer rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all duration-200 hover:bg-cold-cyan/20"
                  >
                    Generate overview
                  </Link>
                )}

                <div className="flex-1" />

                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary">Delete this idea?</span>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                      className="cursor-pointer rounded px-3 py-1.5 text-xs text-red-400 transition-colors duration-200 hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="cursor-pointer rounded px-3 py-1.5 text-xs text-text-secondary transition-colors duration-200 hover:text-text-primary"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="cursor-pointer rounded p-2 text-text-secondary/40 transition-colors duration-200 hover:text-red-400"
                    title="Delete"
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
