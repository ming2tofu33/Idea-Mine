"use client";

import { ObservatoryBackground } from "./observatory-background";

type AppStarfieldBackgroundProps = {
  variant?: "mine" | "vault" | "lab" | "quiet";
};

export function AppStarfieldBackground({
  variant = "mine",
}: AppStarfieldBackgroundProps) {
  const intensity = variant === "quiet" ? "quiet" : "default";

  return (
    <>
      <ObservatoryBackground variant="mine" intensity={intensity} />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(42,60,88,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(42,60,88,0.045)_1px,transparent_1px)] [background-size:72px_72px] opacity-35" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(92,205,229,0.08)_0%,transparent_36%)]" />
        {variant === "lab" && (
          <>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(92,205,229,0.035)_0%,transparent_34%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_1px_at_center,rgba(92,205,229,0.18)_0%,transparent_100%)] [background-size:48px_48px] opacity-20" />
            <div className="absolute inset-x-0 top-0 h-24 animate-[labScan_8s_linear_infinite] bg-[linear-gradient(180deg,transparent_0%,rgba(92,205,229,0.045)_48%,rgba(92,205,229,0.08)_50%,rgba(92,205,229,0.045)_52%,transparent_100%)]" />
            <style>{`
              @keyframes labScan {
                0% { transform: translateY(-6rem); opacity: 0; }
                12% { opacity: 1; }
                88% { opacity: 1; }
                100% { transform: translateY(calc(100vh + 6rem)); opacity: 0; }
              }
            `}</style>
          </>
        )}
        {variant === "vault" && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(92,205,229,0.045)_0%,transparent_28%)]" />
        )}
        {variant === "mine" && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_78%,rgba(255,59,147,0.045)_0%,transparent_22%)]" />
        )}
      </div>
    </>
  );
}
