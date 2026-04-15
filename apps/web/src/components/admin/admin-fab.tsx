"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bug,
  CalendarClock,
  CreditCard,
  Database,
  DollarSign,
  FileText,
  Film,
  Info,
  Pickaxe,
  RotateCcw,
  Settings,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { adminApi, isMockMode, setMockMode } from "@/lib/api";
import { resetMockState } from "@/lib/mock-data";
import type { UserProfile } from "@/types/api";

const PERSONAS = [
  { key: null, label: "Admin", detail: "Unlimited", color: "amber" },
  { key: "free", label: "Free", detail: "1 mine · 2 rerolls", color: "gray" },
  { key: "lite", label: "Lite", detail: "5 mines · 10 rerolls", color: "cyan" },
  { key: "pro", label: "Pro", detail: "50 mines · 20 rerolls", color: "pink" },
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
  if (!isActive) {
    return "text-text-secondary";
  }

  switch (color) {
    case "amber":
      return "text-amber-400";
    case "cyan":
      return "text-cold-cyan";
    case "pink":
      return "text-signal-pink";
    default:
      return "text-text-primary";
  }
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wider text-text-secondary/60 first:mt-0">
      {children}
    </h3>
  );
}

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
        {isPending ? "Processing..." : label}
      </span>
      {dim && (
        <span className="rounded bg-surface-1/30 px-1.5 py-0.5 text-[10px] text-text-secondary/40">
          Soon
        </span>
      )}
    </button>
  );
}

function MockToggle({ mockOn, onToggle }: { mockOn: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-lg border border-line-steel/20 bg-surface-1/50 px-3 py-2 transition-all hover:border-line-steel/40"
    >
      <div>
        <div className="text-sm text-text-secondary">Mock mode</div>
        <div className="text-[10px] text-text-secondary/50">
          {mockOn ? "Using mock data" : "Connected to the live API"}
        </div>
      </div>
      <div
        className={`flex h-5 w-9 items-center rounded-full px-0.5 transition-colors ${
          mockOn ? "bg-amber-400/30" : "bg-surface-2"
        }`}
      >
        <div
          className={`h-4 w-4 rounded-full transition-all ${
            mockOn ? "translate-x-4 bg-amber-400" : "translate-x-0 bg-text-secondary/40"
          }`}
        />
      </div>
    </button>
  );
}

function placeholder(name: string) {
  alert(`${name} is not ready yet.`);
}

export function AdminFab({ profile }: { profile: UserProfile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [mockOn, setMockOn] = useState(isMockMode());
  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleClick(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        fabRef.current &&
        !fabRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  function showFeedback(message: string) {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 1500);
  }

  const personaMutation = useMutation({
    mutationFn: (tier: string | null) => adminApi.setPersona(tier),
    onSuccess: (_data, tier) => {
      queryClient.invalidateQueries();
      showFeedback(tier ? `${tier.toUpperCase()} mode` : "Admin mode");
    },
  });

  const resetMutation = useMutation({
    mutationFn: adminApi.resetDailyState,
    onSuccess: () => {
      queryClient.invalidateQueries();
      showFeedback("Daily state reset");
    },
  });

  const regenMutation = useMutation({
    mutationFn: adminApi.regenerateVeins,
    onSuccess: () => {
      queryClient.invalidateQueries();
      showFeedback("Veins regenerated");
    },
  });

  const handleMockToggle = () => {
    const next = !mockOn;
    setMockMode(next);
    setMockOn(next);
    showFeedback(next ? "Mock mode ON" : "Mock mode OFF");
  };

  const handleNewUserSim = () => {
    setMockMode(true);
    setMockOn(true);
    resetMockState();
    queryClient.invalidateQueries();
    showFeedback("New user simulation started");
  };

  const currentPersona = profile.persona_tier;

  return (
    <>
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
            <div className="max-h-[70vh] overflow-y-auto pr-1">
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

              <SectionTitle>Persona</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                {PERSONAS.map((persona) => {
                  const isActive =
                    persona.key === null
                      ? currentPersona === null
                      : currentPersona === persona.key;

                  return (
                    <button
                      key={persona.key ?? "admin"}
                      onClick={() => personaMutation.mutate(persona.key)}
                      disabled={personaMutation.isPending}
                      className={getChipClasses(persona.color, isActive)}
                    >
                      <div
                        className={`text-xs font-semibold ${getLabelColor(persona.color, isActive)}`}
                      >
                        {persona.label}
                      </div>
                      <div className="text-[10px] text-text-secondary/60">
                        {persona.detail}
                      </div>
                    </button>
                  );
                })}
              </div>

              <SectionTitle>Quick tools</SectionTitle>
              <div className="space-y-1.5">
                <MenuItem
                  label="Reset daily state"
                  icon={RotateCcw}
                  onClick={() => resetMutation.mutate()}
                  isPending={resetMutation.isPending}
                />
                <MenuItem
                  label="Regenerate veins"
                  icon={Pickaxe}
                  onClick={() => regenMutation.mutate()}
                  isPending={regenMutation.isPending}
                />
                <MenuItem
                  label="Simulate new user"
                  icon={UserPlus}
                  onClick={handleNewUserSim}
                />
              </div>

              <SectionTitle>Debug</SectionTitle>
              <div className="space-y-1.5">
                <MenuItem
                  label="View daily state"
                  icon={Bug}
                  onClick={() => placeholder("Daily state")}
                  dim
                />
                <MenuItem
                  label="Open AI costs"
                  icon={DollarSign}
                  onClick={() => {
                    window.location.href = "/admin/costs";
                    setIsOpen(false);
                  }}
                />
                <MenuItem
                  label="Prompt viewer"
                  icon={FileText}
                  onClick={() => placeholder("Prompt viewer")}
                  dim
                />
              </div>

              <SectionTitle>Simulation</SectionTitle>
              <div className="space-y-1.5">
                <MenuItem
                  label="Ad completion simulation"
                  icon={Film}
                  onClick={() => placeholder("Ad completion simulation")}
                  dim
                />
                <MenuItem
                  label="Subscription expiry simulation"
                  icon={CreditCard}
                  onClick={() => placeholder("Subscription expiry simulation")}
                  dim
                />
                <MenuItem
                  label="Date jump"
                  icon={CalendarClock}
                  onClick={() => placeholder("Date jump")}
                  dim
                />
              </div>

              <SectionTitle>Data</SectionTitle>
              <div className="space-y-1.5">
                <MenuItem
                  label="Clear vault"
                  icon={Trash2}
                  onClick={() => placeholder("Clear vault")}
                  dim
                />
                <MenuItem
                  label="Reset all"
                  icon={Database}
                  onClick={() => placeholder("Reset all")}
                  dim
                />
              </div>

              <SectionTitle>Environment</SectionTitle>
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
