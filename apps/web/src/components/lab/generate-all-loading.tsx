"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Circle, Loader2 } from "lucide-react";

interface Step {
  label: string;
  startAt: number;
}

const STEPS: Step[] = [
  { label: "Reading the idea context", startAt: 0 },
  { label: "Generating product design", startAt: 5 },
  { label: "Generating blueprint", startAt: 35 },
  { label: "Generating roadmap", startAt: 65 },
  { label: "Running final checks", startAt: 80 },
];

const WAITING_MESSAGES = [
  "Almost there",
  "Polishing the output",
  "Verifying consistency",
  "Wrapping up the collection",
];

export function GenerateAllLoading() {
  const [elapsed, setElapsed] = useState(0);
  const [waitingIndex, setWaitingIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((prev) => prev + 100), 100);
    return () => clearInterval(interval);
  }, []);

  const elapsedSec = elapsed / 1000;
  let activeIndex = 0;
  for (let i = STEPS.length - 1; i >= 0; i -= 1) {
    if (elapsedSec >= STEPS[i].startAt) {
      activeIndex = i;
      break;
    }
  }

  const isLastStep = activeIndex === STEPS.length - 1;

  useEffect(() => {
    if (!isLastStep) return;
    const interval = setInterval(() => {
      setWaitingIndex((prev) => (prev + 1) % WAITING_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isLastStep]);

  const progressPercent = Math.min(95, 25 * Math.log(1 + elapsed / 15000) * 10);

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16">
      <h3 className="mb-8 text-base font-semibold text-text-primary">
        Generating project collection
      </h3>

      <div className="mb-8 w-full max-w-xs space-y-3">
        {STEPS.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;

          return (
            <div key={step.label} className="flex items-center gap-3">
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
              ) : isActive ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-cold-cyan" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-text-secondary/20" />
              )}

              <span
                className={[
                  "text-sm",
                  isCompleted
                    ? "text-text-secondary/60 line-through"
                    : isActive
                      ? "font-medium text-cold-cyan"
                      : "text-text-secondary/30",
                ].join(" ")}
              >
                {isActive && isLastStep
                  ? WAITING_MESSAGES[waitingIndex]
                  : isCompleted
                    ? `${step.label} complete`
                    : isActive
                      ? `${step.label}...`
                      : step.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mb-4 h-1.5 w-64 overflow-hidden rounded-full bg-surface-2/40">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cold-cyan/40 via-cold-cyan/70 to-cold-cyan/40"
          style={{ width: `${progressPercent}%`, transition: "width 0.3s ease-out" }}
        />
      </div>

      <p className="mb-2 text-xs font-medium text-text-secondary/50">
        {Math.round(progressPercent)}%
      </p>
      <p className="text-[11px] text-text-secondary/30">
        {Math.floor(elapsedSec)}s elapsed
      </p>
    </div>
  );
}
