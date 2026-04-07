"use client";

interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
}

export function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        const isFuture = i > currentStep;

        return (
          <div key={i} className="flex items-center gap-1">
            {i > 0 && (
              <div
                className={[
                  "h-px w-4 transition-colors duration-200",
                  isCompleted || isCurrent
                    ? "bg-cold-cyan/40"
                    : "bg-line-steel/30",
                ].join(" ")}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={[
                  "h-2 w-2 rounded-full transition-colors duration-200",
                  isCurrent
                    ? "bg-cold-cyan shadow-[0_0_6px_rgba(92,205,229,0.4)]"
                    : isCompleted
                      ? "bg-cold-cyan/60"
                      : "bg-line-steel/40",
                ].join(" ")}
              />
              <span
                className={[
                  "text-[11px] transition-colors duration-200",
                  isCurrent
                    ? "font-medium text-text-primary"
                    : isCompleted
                      ? "text-cold-cyan/60"
                      : "text-text-secondary/40",
                ].join(" ")}
              >
                {step}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
