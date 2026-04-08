"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { MineBackground } from "@/components/backgrounds/mine-background";
import { IdeaCard } from "@/components/mine/idea-card";
import { miningApi, ideasApi } from "@/lib/api";
import type { Idea } from "@/types/api";

// --- Loading text rotation ---

const LOADING_PHASES = [
  { text: "광맥을 분석하는 중...", delay: 0 },
  { text: "결정 구조를 스캔하는 중...", delay: 3000 },
  { text: "아이디어 결정을 추출하는 중...", delay: 6000 },
];

function LoadingState() {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const timers = LOADING_PHASES.slice(1).map((phase, i) =>
      setTimeout(() => setPhaseIndex(i + 1), phase.delay),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      {/* Pulsing dot */}
      <div className="mb-6 h-3 w-3 animate-pulse rounded-full bg-signal-pink/60" />
      <p className="text-sm text-text-secondary transition-opacity duration-500">
        {LOADING_PHASES[phaseIndex].text}
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
        {/* Top bar */}
        <div className="mx-auto mb-6 w-full max-w-2xl">
          <Link
            href="/mine"
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
            광산으로 돌아가기
          </Link>
        </div>

        {/* Content */}
        <div className="mx-auto w-full max-w-2xl flex-1">
          {mineMutation.isPending ? (
            <LoadingState />
          ) : mineMutation.isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-text-secondary">
                채굴에 실패했습니다
              </p>
              <p className="mt-1 text-xs text-text-secondary/60">
                {mineMutation.error instanceof Error
                  ? mineMutation.error.message
                  : "알 수 없는 오류"}
              </p>
              <Link
                href="/mine"
                className="mt-6 rounded-lg border border-line-steel bg-surface-2 px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-signal-pink/30 hover:text-text-primary"
              >
                돌아가기
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
          <div className="flex w-full max-w-2xl items-center justify-between rounded-2xl border border-white/[0.06] bg-bg-deep/80 px-6 py-4 backdrop-blur-xl">
            <span className="text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">
                {selectedIds.size}
              </span>
              개 선택됨
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
              {vaultMutation.isPending ? "반입 중..." : "금고에 반입 💎"}
            </button>
          </div>
        </div>
      )}

      {/* Vault success toast */}
      {vaultSuccess && (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center">
          <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-medium text-emerald-400 backdrop-blur-sm">
            금고에 반입 완료!
          </div>
        </div>
      )}
    </div>
  );
}
