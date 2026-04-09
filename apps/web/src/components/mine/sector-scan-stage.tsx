"use client";

import { motion } from "framer-motion";
import type { Vein } from "@/types/api";
import { usePrefersReducedMotion } from "@/components/shared/use-prefers-reduced-motion";
import { VeinSignalNode } from "./vein-signal-node";

type SectorScanStageProps = {
  veins: Vein[];
  selectedVeinId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  warningMessage?: string;
};

const SLOT_ORDER = ["top", "left", "right"] as const;

const SLOT_STYLES: Record<(typeof SLOT_ORDER)[number], string> = {
  top: "lg:left-1/2 lg:top-[10%] lg:-translate-x-1/2",
  left: "lg:left-[4%] lg:bottom-[14%]",
  right: "lg:right-[6%] lg:bottom-[8%]",
};

function ScanGhostNode({
  position,
  label,
}: {
  position: (typeof SLOT_ORDER)[number];
  label: string;
}) {
  return (
    <div
      className={[
        "relative w-full sm:max-w-[240px] lg:absolute lg:w-[min(270px,46vw)]",
        SLOT_STYLES[position],
      ].join(" ")}
    >
      <div className="relative overflow-hidden rounded-[28px] border border-line-steel/35 bg-[linear-gradient(180deg,rgba(10,18,31,0.78)_0%,rgba(6,12,24,0.7)_100%)] p-3.5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(92,205,229,0.08)_0%,transparent_48%),radial-gradient(circle_at_50%_120%,rgba(255,59,147,0.06)_0%,transparent_50%)] opacity-80" />
        <div className="relative flex items-center justify-between">
          <div className="h-3.5 w-24 rounded-full bg-surface-2/70" />
          <div className="h-5 w-14 rounded-full bg-surface-2/60" />
        </div>
        <div className="relative mt-3 h-40 overflow-hidden rounded-[22px] border border-line-steel/35 bg-surface-1/50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(92,205,229,0.1)_0%,transparent_46%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(92,205,229,0.08)_50%,transparent_100%)] opacity-70" />
          <div className="absolute left-3 top-3 h-12 w-12 rounded-full border border-cold-cyan/20" />
          <div className="absolute right-4 bottom-4 h-10 w-10 rounded-full border border-signal-pink/20" />
        </div>
        <div className="relative mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.26em] text-text-secondary/60">
          <span>{label}</span>
          <span>awaiting lock</span>
        </div>
      </div>
    </div>
  );
}

export function SectorScanStage({
  veins,
  selectedVeinId,
  onSelect,
  isLoading,
  isError,
  errorMessage,
  warningMessage,
}: SectorScanStageProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const hasTargets = !isLoading && !isError && veins.length > 0;
  const veinBySlotIndex = new Map(veins.map((vein) => [vein.slot_index, vein]));

  return (
    <motion.section
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? undefined : { duration: 0.45, ease: "easeOut" }}
      className="observatory-panel observatory-frame relative isolate overflow-hidden rounded-[32px] border border-line-steel/55 p-4 sm:p-5"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(92,205,229,0.1)_0%,transparent_30%),radial-gradient(circle_at_50%_50%,rgba(255,59,147,0.05)_0%,transparent_54%),linear-gradient(180deg,rgba(255,255,255,0.02)_0%,transparent_22%,rgba(255,255,255,0.015)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(42,60,88,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(42,60,88,0.12)_1px,transparent_1px)] [background-size:64px_64px] opacity-30" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,13,0.02)_0%,rgba(2,5,13,0.14)_55%,rgba(2,5,13,0.42)_100%)]" />

      <div className="absolute inset-0 hidden lg:block">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cold-cyan/12" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cold-cyan/15" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-signal-pink/10" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-[radial-gradient(circle,rgba(92,205,229,0.1)_0%,transparent_68%)]" />
      </div>

      <div className="relative z-10 flex min-h-0 flex-col lg:min-h-[680px]">
        <div className="flex items-center justify-between gap-3 border-b border-line-steel/30 pb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-text-secondary/70">
              sector scan shell
            </p>
            <p className="mt-1 text-xs text-text-secondary/60">
              {isLoading
                ? "acquiring signatures"
                : isError
                  ? "signal loss"
                  : `${veins.length} detected targets`}
            </p>
          </div>

          <div className="rounded-full border border-line-steel/40 bg-surface-1/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-text-secondary/70">
            {hasTargets ? "target map stable" : "scan pending"}
          </div>
        </div>

        {warningMessage && !isError && (
          <div className="mt-3 rounded-2xl border border-cold-cyan/20 bg-[rgba(92,205,229,0.07)] px-4 py-3 text-sm leading-6 text-text-primary/90">
            <span className="mr-2 text-[11px] uppercase tracking-[0.28em] text-cold-cyan/70">
              scan warning
            </span>
            {warningMessage}
          </div>
        )}

        <div className="relative flex flex-1 items-start justify-center pt-5">
          <div className="relative flex w-full max-w-[560px] flex-col items-center gap-3 lg:block lg:max-w-none">
            {isLoading ? (
              <>
                <ScanGhostNode position="top" label="apex return" />
                <ScanGhostNode position="left" label="lateral echo" />
                <ScanGhostNode position="right" label="edge echo" />

                <div className="mx-auto rounded-full border border-cold-cyan/20 bg-surface-1/60 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-cold-cyan/70 backdrop-blur-md lg:absolute lg:left-1/2 lg:top-[53%] lg:-translate-x-1/2">
                  locking target
                </div>
              </>
            ) : isError ? (
              <>
                <ScanGhostNode position="top" label="apex return" />
                <ScanGhostNode position="left" label="lateral echo" />
                <ScanGhostNode position="right" label="edge echo" />

                <div className="mx-auto max-w-sm rounded-2xl border border-line-steel/45 bg-surface-1/75 px-5 py-4 text-center backdrop-blur-md lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-cold-cyan/70">
                    scan interrupted
                  </p>
                  <p className="mt-2 text-sm text-text-primary">
                    Target acquisition failed.
                  </p>
                  <p className="mt-2 max-w-sm text-xs leading-5 text-text-secondary">
                    {errorMessage ?? "The sector feed dropped before the scan could lock."}
                  </p>
                </div>
              </>
            ) : (
              <>
                {SLOT_ORDER.map((position, index) => {
                  const vein = veinBySlotIndex.get(index + 1);

                  if (!vein) {
                    return (
                      <ScanGhostNode
                        key={position}
                        position={position}
                        label={
                          position === "top"
                            ? "apex return"
                            : position === "left"
                              ? "lateral echo"
                              : "edge echo"
                        }
                      />
                    );
                  }

                  return (
                    <VeinSignalNode
                      key={vein.id}
                      vein={vein}
                      position={position}
                      selected={vein.id === selectedVeinId}
                      onSelect={onSelect}
                    />
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
