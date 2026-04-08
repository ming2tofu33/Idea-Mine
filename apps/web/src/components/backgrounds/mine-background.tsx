"use client";

import { ObservatoryBackground } from "./observatory-background";

export function MineBackground() {
  return (
    <>
      <ObservatoryBackground variant="mine" intensity="default" />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(92,205,229,0.08)_0%,transparent_30%),radial-gradient(circle_at_18%_78%,rgba(255,59,147,0.05)_0%,transparent_22%),linear-gradient(180deg,rgba(2,5,13,0.05)_0%,rgba(2,5,13,0.16)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(42,60,88,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(42,60,88,0.06)_1px,transparent_1px)] [background-size:72px_72px] opacity-35" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(92,205,229,0.1)_0%,transparent_34%)]" />
      </div>
    </>
  );
}
