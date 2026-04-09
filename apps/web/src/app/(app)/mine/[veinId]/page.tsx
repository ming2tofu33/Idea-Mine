"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { MineBackground } from "@/components/backgrounds/mine-background";
import { IdeaCard } from "@/components/mine/idea-card";
import { MINE_LABELS, type MineLanguage } from "@/components/mine/mine-labels";
import { PageHeader } from "@/components/shared/page-header";
import { useProfile } from "@/hooks/use-profile";
import { miningApi, ideasApi } from "@/lib/api";
import type { Idea } from "@/types/api";

// --- Loading text rotation ---

function LoadingState({ lang }: { lang: MineLanguage }) {
  const [phaseIndex, setPhaseIndex] = useState(0);

  const phases = [
    MINE_LABELS.loadingPhase1[lang],
    MINE_LABELS.loadingPhase2[lang],
    MINE_LABELS.loadingPhase3[lang],
  ];

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhaseIndex(1), 3000),
      setTimeout(() => setPhaseIndex(2), 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      {/* Pulsing dot */}
      <div className="mb-6 h-3 w-3 animate-pulse rounded-full bg-signal-pink/60" />
      <p className="text-sm text-text-secondary transition-opacity duration-500">
        {phases[phaseIndex]}
      </p>
    </div>
  );
}

// --- Page ---

export default function MiningResultPage({
  params,
}: {
  params: Promise<{ veinId: string }>;
}) {
  const { veinId } = use(params);
  const { profile } = useProfile();
  const lang: MineLanguage = (profile?.language ?? "ko") as MineLanguage;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [vaultedIds, setVaultedIds] = useState<Set<string>>(new Set());
  const [vaultSuccess, setVaultSuccess] = useState(false);

  // --- Mine mutation ---
  const mineMutation = useMutation({
    mutationFn: () => miningApi.mine(veinId),
  });

  // Trigger mining on mount (ref prevents Strict Mode double-fire)
  const hasMined = useRef(false);
  useEffect(() => {
    if (hasMined.current) return;
    hasMined.current = true;
    mineMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [veinId]);

  // Initialize vaulted state from response
  useEffect(() => {
    if (mineMutation.data) {
      const alreadyVaulted = new Set(
        mineMutation.data.ideas
          .filter((idea) => idea.is_vaulted)
          .map((idea) => idea.id),
      );
      setVaultedIds(alreadyVaulted);
    }
  }, [mineMutation.data]);

  // --- Selection ---
  const handleToggle = useCallback((ideaId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(ideaId)) {
        next.delete(ideaId);
      } else {
        next.add(ideaId);
      }
      return next;
    });
  }, []);

  // --- Vault mutation ---
  const vaultMutation = useMutation({
    mutationFn: () => ideasApi.vault(Array.from(selectedIds), veinId),
    onSuccess: (data) => {
      // Mark vaulted
      setVaultedIds((prev) => {
        const next = new Set(prev);
        for (const id of data.idea_ids) {
          next.add(id);
        }
        return next;
      });
      // Clear selection
      setSelectedIds(new Set());
      // Show success feedback
      setVaultSuccess(true);
      setTimeout(() => setVaultSuccess(false), 2500);
    },
  });

  // --- Sorted ideas ---
  const ideas: Idea[] = mineMutation.data?.ideas ?? [];
  const sortedIdeas = [...ideas].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="relative flex min-h-0 flex-1">
      <MineBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-6 w-full max-w-3xl space-y-4">
          <Link
            href="/mine"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.22em] text-text-secondary/75 transition-colors hover:text-cold-cyan"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {MINE_LABELS.backToMine[lang]}
          </Link>
          <PageHeader
            eyebrow={MINE_LABELS.resultEyebrow[lang]}
            title={MINE_LABELS.resultTitle[lang]}
            subtitle={MINE_LABELS.resultSubtitle[lang]}
          />
        </div>

        {/* Content */}
        <div className="mx-auto w-full max-w-3xl flex-1">
          {mineMutation.isPending ? (
            <LoadingState lang={lang} />
          ) : mineMutation.isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-text-secondary">
                {MINE_LABELS.miningFailed[lang]}
              </p>
              <p className="mt-1 text-xs text-text-secondary/60">
                {mineMutation.error instanceof Error
                  ? mineMutation.error.message
                  : MINE_LABELS.unknownError[lang]}
              </p>
              <Link
                href="/mine"
                className="mt-6 rounded-lg border border-line-steel bg-surface-2 px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-signal-pink/30 hover:text-text-primary"
              >
                {MINE_LABELS.goBack[lang]}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pb-24">
              {sortedIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  isSelected={selectedIds.has(idea.id)}
                  onToggle={handleToggle}
                  isVaulted={vaultedIds.has(idea.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating vault bar */}
      {selectedIds.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center p-4">
          <div className="flex w-full max-w-3xl items-center justify-between rounded-2xl border border-white/[0.06] bg-bg-deep/80 px-6 py-4 backdrop-blur-xl">
            <span className="text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">
                {selectedIds.size}
              </span>{" "}
              {MINE_LABELS.selectedSuffix[lang]}
            </span>

            <button
              type="button"
              disabled={vaultMutation.isPending}
              onClick={() => vaultMutation.mutate()}
              className={[
                "rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200",
                vaultMutation.isPending
                  ? "cursor-not-allowed bg-signal-pink/40 text-white/60"
                  : "bg-signal-pink text-white hover:bg-signal-pink/90 hover:shadow-[0_0_20px_rgba(255,59,147,0.3)]",
              ].join(" ")}
            >
              {vaultMutation.isPending
                ? MINE_LABELS.vaulting[lang]
                : MINE_LABELS.vaultIntake[lang]}
            </button>
          </div>
        </div>
      )}

      {/* Vault success toast */}
      {vaultSuccess && (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center">
          <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-medium text-emerald-400 backdrop-blur-sm">
            {MINE_LABELS.vaultSuccess[lang]}
          </div>
        </div>
      )}
    </div>
  );
}
