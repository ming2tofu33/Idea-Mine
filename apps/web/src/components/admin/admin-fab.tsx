"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Settings, RotateCcw, Pickaxe, X, UserPlus, Bug,
  DollarSign, FileText, Film, CreditCard, CalendarClock,
  Trash2, Database, Info,
} from "lucide-react";
import { adminApi, isMockMode, setMockMode } from "@/lib/api";
import { resetMockState } from "@/lib/mock-data";
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
  if (!isActive) return `${base} border-line-steel/20 bg-surface-1/30 hover:border-line-steel/40`;
  switch (color) {
    case "amber": return `${base} border-amber-400/40 bg-amber-400/10 shadow-[0_0_12px_rgba(245,158,11,0.1)]`;
    case "cyan": return `${base} border-cold-cyan/40 bg-cold-cyan/10 shadow-[0_0_12px_rgba(92,205,229,0.1)]`;
    case "pink": return `${base} border-signal-pink/40 bg-signal-pink/10 shadow-[0_0_12px_rgba(255,59,147,0.1)]`;
    default: return `${base} border-line-steel/40 bg-surface-2/60`;
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

// --- Section title ---

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wider text-text-secondary/60 first:mt-0">
      {children}
    </h3>
  );
}

// --- Menu item ---

function MenuItem({
  label,
  icon: Icon,
  onClick,
  dim,
  isPending,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  dim?: boolean;
  isPending?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={dim || isPending}
      className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${
        dim
          ? "border-line-steel/10 bg-surface-1/20 text-text-secondary/40"
          : "border-line-steel/20 bg-surface-1/50 text-text-secondary hover:border-line-steel/40 hover:text-text-primary"
      } disabled:opacity-50`}
    >
      <span className="flex items-center gap-2">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {isPending ? "처리 중..." : label}
      </span>
      {dim && (
        <span className="rounded bg-surface-1/30 px-1.5 py-0.5 text-[10px] text-text-secondary/40">
          준비 중
        </span>
      )}
    </button>
  );
}

// --- Mock toggle ---

function MockToggle({ mockOn, onToggle }: { mockOn: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="flex w-full items-center justify-between rounded-lg border border-line-steel/20 bg-surface-1/50 px-3 py-2 transition-all hover:border-line-steel/40">
      <div>
        <div className="text-sm text-text-secondary">Mock 모드</div>
        <div className="text-[10px] text-text-secondary/50">
          {mockOn ? "가짜 데이터 사용 중" : "실제 API 연결 중"}
        </div>
      </div>
      <div className={`flex h-5 w-9 items-center rounded-full px-0.5 transition-colors ${mockOn ? "bg-amber-400/30" : "bg-surface-2"}`}>
        <div className={`h-4 w-4 rounded-full transition-all ${mockOn ? "translate-x-4 bg-amber-400" : "translate-x-0 bg-text-secondary/40"}`} />
      </div>
    </button>
  );
}

// --- placeholder handler ---

function placeholder(name: string) {
  alert(`${name} 기능은 아직 준비 중이에요`);
}

// --- Component ---

export function AdminFab({ profile }: { profile: UserProfile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [mockOn, setMockOn] = useState(isMockMode());
  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        fabRef.current && !fabRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 1500);
  }

  // Persona
  const personaMutation = useMutation({
    mutationFn: (tier: string | null) => adminApi.setPersona(tier),
    onSuccess: (_data, tier) => {
      queryClient.invalidateQueries();
      showFeedback(tier ? `${tier.toUpperCase()} 모드` : "Admin 모드");
    },
  });

  // Tools
  const resetMutation = useMutation({
    mutationFn: adminApi.resetDailyState,
    onSuccess: () => { queryClient.invalidateQueries(); showFeedback("일일 상태 리셋 완료"); },
  });

  const regenMutation = useMutation({
    mutationFn: adminApi.regenerateVeins,
    onSuccess: () => { queryClient.invalidateQueries(); showFeedback("광맥 재생성 완료"); },
  });

  // Mock toggle
  const handleMockToggle = () => {
    const next = !mockOn;
    setMockMode(next);
    setMockOn(next);
    showFeedback(next ? "Mock 모드 ON" : "Mock 모드 OFF");
  };

  // New user simulation
  const handleNewUserSim = () => {
    setMockMode(true);
    setMockOn(true);
    resetMockState();
    queryClient.invalidateQueries();
    showFeedback("신규 유저 시뮬레이션 시작");
  };

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
            {/* Scrollable content */}
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              {/* Feedback toast */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-3 w-fit rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-400"
                  >
                    {feedback}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Persona */}
              <SectionTitle>페르소나</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                {PERSONAS.map((p) => {
                  const isActive = p.key === null ? currentPersona === null : currentPersona === p.key;
                  return (
                    <button
                      key={p.key ?? "admin"}
                      onClick={() => personaMutation.mutate(p.key)}
                      disabled={personaMutation.isPending}
                      className={getChipClasses(p.color, isActive)}
                    >
                      <div className={`text-xs font-semibold ${getLabelColor(p.color, isActive)}`}>
                        {p.label}
                      </div>
                      <div className="text-[10px] text-text-secondary/60">{p.detail}</div>
                    </button>
                  );
                })}
              </div>

              {/* Quick tools */}
              <SectionTitle>빠른 도구</SectionTitle>
              <div className="space-y-1.5">
                <MenuItem
                  label="일일 상태 리셋"
                  icon={RotateCcw}
                  onClick={() => resetMutation.mutate()}
                  isPending={resetMutation.isPending}
                />
                <MenuItem
                  label="광맥 재생성"
                  icon={Pickaxe}
                  onClick={() => regenMutation.mutate()}
                  isPending={regenMutation.isPending}
                />
                <MenuItem
                  label="신규 유저 시뮬레이션"
                  icon={UserPlus}
                  onClick={handleNewUserSim}
                />
              </div>

              {/* Debug */}
              <SectionTitle>디버그</SectionTitle>
              <div className="space-y-1.5">
                <MenuItem label="Daily State 보기" icon={Bug} onClick={() => placeholder("Daily State")} dim />
                <MenuItem
                  label="AI 비용 확인"
                  icon={DollarSign}
                  onClick={() => { window.location.href = "/admin/costs"; setIsOpen(false); }}
                />
                <MenuItem label="프롬프트 뷰어" icon={FileText} onClick={() => placeholder("프롬프트 뷰어")} dim />
              </div>

              {/* Simulation */}
              <SectionTitle>시뮬레이션</SectionTitle>
              <div className="space-y-1.5">
                <MenuItem label="광고 완료 시뮬레이션" icon={Film} onClick={() => placeholder("광고 시뮬레이션")} dim />
                <MenuItem label="구독 만료 시뮬레이션" icon={CreditCard} onClick={() => placeholder("구독 시뮬레이션")} dim />
                <MenuItem label="날짜 점프" icon={CalendarClock} onClick={() => placeholder("날짜 점프")} dim />
              </div>

              {/* Data management */}
              <SectionTitle>데이터 관리</SectionTitle>
              <div className="space-y-1.5">
                <MenuItem label="금고 초기화" icon={Trash2} onClick={() => placeholder("금고 초기화")} dim />
                <MenuItem label="전체 리셋" icon={Database} onClick={() => placeholder("전체 리셋")} dim />
              </div>

              {/* Environment */}
              <SectionTitle>환경</SectionTitle>
              <div className="space-y-1.5">
                <MockToggle mockOn={mockOn} onToggle={handleMockToggle} />
                <div className="flex items-center gap-1.5 px-1 py-1">
                  <Info className="h-3 w-3 text-text-secondary/30" />
                  <span className="text-[10px] text-text-secondary/40">
                    App v0.1.0 | API v0.1.0
                  </span>
                </div>
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
