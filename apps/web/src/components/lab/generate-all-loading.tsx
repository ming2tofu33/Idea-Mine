"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Loader2, Circle } from "lucide-react";

interface Step {
  label: string;
  startAt: number; // seconds
}

const STEPS: Step[] = [
  { label: "유형 분석", startAt: 0 },
  { label: "제품 설계서 생성 중", startAt: 5 },
  { label: "기술 청사진 생성 중", startAt: 35 },
  { label: "실행 로드맵 생성 중", startAt: 65 },
  { label: "품질 검증 중", startAt: 80 },
];

const WAITING_MESSAGES = [
  "거의 다 됐어요...",
  "마지막 품질 점검 중...",
  "일관성을 검증하는 중...",
  "조금만 더 기다려주세요...",
];

export function GenerateAllLoading() {
  const [elapsed, setElapsed] = useState(0);
  const [waitingIndex, setWaitingIndex] = useState(0);

  // Elapsed timer (100ms intervals)
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const elapsedSec = elapsed / 1000;

  // Determine active step index
  let activeIndex = 0;
  for (let i = STEPS.length - 1; i >= 0; i--) {
    if (elapsedSec >= STEPS[i].startAt) {
      activeIndex = i;
      break;
    }
  }

  // Waiting message rotation for last step
  const isLastStep = activeIndex === STEPS.length - 1;
  useEffect(() => {
    if (!isLastStep) return;
    const interval = setInterval(() => {
      setWaitingIndex((prev) => (prev + 1) % WAITING_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isLastStep]);

  // Progress: logarithmic curve, max 95%
  const progressPercent = Math.min(95, 25 * Math.log(1 + elapsed / 15000) * 10);

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16">
      {/* Title */}
      <h3 className="mb-8 text-base font-semibold text-text-primary">
        프로젝트 컬렉션 생성 중
      </h3>

      {/* Steps */}
      <div className="mb-8 w-full max-w-xs space-y-3">
        {STEPS.map((step, i) => {
          const isCompleted = i < activeIndex;
          const isActive = i === activeIndex;
          const isPending = i > activeIndex;

          return (
            <div
              key={step.label}
              className="flex items-center gap-3"
            >
              {/* Icon */}
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
              ) : isActive ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-cold-cyan" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-text-secondary/20" />
              )}

              {/* Label */}
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
                    ? step.label.replace(" 생성 중", "") + " 완료"
                    : isActive
                      ? step.label + "..."
                      : step.label.replace(" 생성 중", "") + " 대기"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-1.5 w-64 overflow-hidden rounded-full bg-surface-2/40">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cold-cyan/40 via-cold-cyan/70 to-cold-cyan/40"
          style={{
            width: `${progressPercent}%`,
            transition: "width 0.3s ease-out",
          }}
        />
      </div>

      {/* Percentage */}
      <p className="mb-2 text-xs font-medium text-text-secondary/50">
        {Math.round(progressPercent)}%
      </p>

      {/* Elapsed */}
      <p className="text-[11px] text-text-secondary/30">
        {Math.floor(elapsedSec)}초 경과...
      </p>
    </div>
  );
}
