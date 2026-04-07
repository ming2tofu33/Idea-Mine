"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Settings, RotateCcw, Pickaxe, X } from "lucide-react";
import { adminApi } from "@/lib/api";
import type { UserProfile } from "@/types/api";

// --- Persona chips ---

const PERSONAS = [
  { key: null, label: "Admin", detail: "무제한", color: "amber" },
  { key: "free", label: "Free", detail: "채굴1 · 리롤2", color: "gray" },
  { key: "lite", label: "Lite", detail: "채굴5 · 리롤10", color: "cyan" },
  { key: "pro", label: "Pro", detail: "채굴50 · 리롤20", color: "pink" },
] as const;

function getChipClasses(color: string, isActive: boolean) {
  const base = "cursor-pointer rounded-lg border px-3 py-2 text-left transition-all duration-200";

  if (!isActive) {
    return `${base} border-line-steel/20 bg-surface-1/30 hover:border-line-steel/40`;
  }

  switch (color) {
    case "amber":
      return `${base} border-amber-400/40 bg-amber-400/10 shadow-[0_0_12px_rgba(245,158,11,0.1)]`;
    case "cyan":
      return `${base} border-cold-cyan/40 bg-cold-cyan/10 shadow-[0_0_12px_rgba(92,205,229,0.1)]`;
    case "pink":
      return `${base} border-signal-pink/40 bg-signal-pink/10 shadow-[0_0_12px_rgba(255,59,147,0.1)]`;
    default:
      return `${base} border-line-steel/40 bg-surface-2/60`;
  }
}

function getLabelColor(color: string, isActive: boolean) {
  if (!isActive) return "text-text-secondary";
  switch (color) {
    case "amber": return "text-amber-400";
    case "cyan": return "text-cold-cyan";
    case "pink": return "text-signal-pink";
    default: return "text-text-primary";
  }
}

// --- Component ---

export function AdminFab({ profile }: { profile: UserProfile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        fabRef.current &&
        !fabRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // Show feedback briefly
  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 1500);
  }

  // Persona mutation
  const personaMutation = useMutation({
    mutationFn: (tier: string | null) => adminApi.setPersona(tier),
    onSuccess: (_data, tier) => {
      queryClient.invalidateQueries();
      showFeedback(tier ? `${tier.toUpperCase()} 모드` : "Admin 모드");
    },
  });

  // Tool mutations
  const resetMutation = useMutation({
    mutationFn: adminApi.resetDailyState,
    onSuccess: () => {
      queryClient.invalidateQueries();
      showFeedback("일일 상태 리셋 완료");
    },
  });

  const regenMutation = useMutation({
    mutationFn: adminApi.regenerateVeins,
    onSuccess: () => {
      queryClient.invalidateQueries();
      showFeedback("광맥 재생성 완료");
    },
  });

  const currentPersona = profile.persona_tier;

  return (
    <>
      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 z-50 w-72 rounded-xl border border-line-steel/30 bg-bg-deep/90 p-4 backdrop-blur-xl"
          >
            {/* Feedback toast */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-10 left-0 right-0 mx-auto w-fit rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-400"
                >
                  {feedback}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Persona section */}
            <div className="mb-4">
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-secondary/60">
                페르소나
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {PERSONAS.map((p) => {
                  const isActive =
                    p.key === null
                      ? currentPersona === null
                      : currentPersona === p.key;
                  return (
                    <button
                      key={p.key ?? "admin"}
                      onClick={() => personaMutation.mutate(p.key)}
                      disabled={personaMutation.isPending}
                      className={getChipClasses(p.color, isActive)}
                    >
                      <div
                        className={`text-xs font-semibold ${getLabelColor(p.color, isActive)}`}
                      >
                        {p.label}
                      </div>
                      <div className="text-[10px] text-text-secondary/60">
                        {p.detail}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tools section */}
            <div>
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-secondary/60">
                빠른 도구
              </h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => resetMutation.mutate()}
                  disabled={resetMutation.isPending}
                  className="flex w-full items-center gap-2 rounded-lg border border-line-steel/20 bg-surface-1/50 px-3 py-2 text-sm text-text-secondary transition-all hover:border-line-steel/40 hover:text-text-primary disabled:opacity-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {resetMutation.isPending ? "리셋 중..." : "일일 상태 리셋"}
                </button>
                <button
                  onClick={() => regenMutation.mutate()}
                  disabled={regenMutation.isPending}
                  className="flex w-full items-center gap-2 rounded-lg border border-line-steel/20 bg-surface-1/50 px-3 py-2 text-sm text-text-secondary transition-all hover:border-line-steel/40 hover:text-text-primary disabled:opacity-50"
                >
                  <Pickaxe className="h-3.5 w-3.5" />
                  {regenMutation.isPending ? "재생성 중..." : "광맥 재생성"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <button
        ref={fabRef}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-amber-400/30 bg-surface-2 transition-all duration-200 hover:border-amber-400/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
        aria-label="Admin panel"
      >
        {isOpen ? (
          <X className="h-5 w-5 text-amber-400" />
        ) : (
          <Settings className="h-5 w-5 text-amber-400" />
        )}
      </button>
    </>
  );
}
