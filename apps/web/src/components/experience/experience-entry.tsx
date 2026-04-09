"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MineBackground } from "@/components/backgrounds/mine-background";
import { StatusRail } from "@/components/shared/status-rail";
import { SignalButton } from "@/components/shared/signal-button";
import { usePrefersReducedMotion } from "@/components/shared/use-prefers-reduced-motion";
import { trackExperienceEvent } from "@/lib/experience-events";
import type { ExperienceVein } from "@/types/experience";

type ExperienceEntryProps = {
  veins: ExperienceVein[];
};

const RARITY_META: Record<
  ExperienceVein["rarity"],
  { label: string; accent: string; rim: string; glow: string }
> = {
  common: {
    label: "Common",
    accent: "bg-text-secondary",
    rim: "border-line-steel/45",
    glow: "shadow-[0_0_26px_rgba(154,170,192,0.14)]",
  },
  rare: {
    label: "Rare",
    accent: "bg-[#8B5CF6]",
    rim: "border-[#8B5CF6]/45",
    glow: "shadow-[0_0_30px_rgba(139,92,246,0.2)]",
  },
  golden: {
    label: "Golden",
    accent: "bg-[#C4B07A]",
    rim: "border-[#C4B07A]/45",
    glow: "shadow-[0_0_34px_rgba(196,176,122,0.22)]",
  },
};

function DemoVeinCard({ vein }: { vein: ExperienceVein }) {
  const rarity = RARITY_META[vein.rarity];

  return (
    <Link
      href={`/experience/${vein.id}`}
      onClick={() =>
        trackExperienceEvent({
          eventName: "experience_vein_select",
          route: "/experience",
          veinId: vein.id,
        })
      }
      className="group relative block overflow-hidden rounded-[28px] border bg-[linear-gradient(180deg,rgba(10,18,31,0.92)_0%,rgba(6,12,24,0.86)_100%)] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cold-cyan/40"
      style={{
        borderColor: "rgba(42, 60, 88, 0.42)",
      }}
    >
      <div
        className={[
          "pointer-events-none absolute inset-0 rounded-[28px] transition-opacity duration-300",
          rarity.glow,
        ].join(" ")}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={["inline-flex h-2.5 w-2.5 shrink-0 rounded-full", rarity.accent].join(" ")}
            />
            <span className="text-[10px] uppercase tracking-[0.3em] text-text-secondary/70">
              {vein.codename}
            </span>
          </div>
          <p className="mt-3 text-base font-semibold text-text-primary line-clamp-2">
            {vein.previewLineKo}
          </p>
        </div>
        <span className="rounded-full border border-line-steel/45 bg-surface-1/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-text-secondary/70">
          {rarity.label}
        </span>
      </div>

      <div className="relative mt-4 flex flex-wrap gap-1.5">
        {vein.keywords.slice(0, 4).map((kw, i) => (
          <span
            key={i}
            className="rounded-full border border-line-steel/35 bg-surface-1/50 px-2.5 py-1 text-[11px] text-text-secondary"
          >
            {kw.ko}
          </span>
        ))}
      </div>

      <div className="relative mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-text-secondary/70">
        <span>detected target</span>
        <span className="text-cold-cyan group-hover:text-cold-cyan/90">
          preview →
        </span>
      </div>
    </Link>
  );
}

export function ExperienceEntry({ veins }: ExperienceEntryProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const animateMotion = prefersReducedMotion === false;

  useEffect(() => {
    trackExperienceEvent({
      eventName: "experience_entry_view",
      route: "/experience",
    });
  }, []);

  return (
    <div className="relative flex min-h-0 flex-1">
      <MineBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto mb-4 w-full max-w-7xl">
          <StatusRail
            variant="app"
            left={
              <span className="text-xs uppercase tracking-[0.28em] text-text-secondary/75">
                public demo
              </span>
            }
            center={
              <span className="hidden text-[11px] uppercase tracking-[0.22em] text-cold-cyan/75 lg:inline">
                오늘의 광맥 미리보기
              </span>
            }
            right={
              <Link
                href="/auth/sign-in?next=/mine"
                className="rounded-md border border-cold-cyan/30 bg-cold-cyan/10 px-3 py-1.5 text-xs text-cold-cyan transition-all hover:bg-cold-cyan/20"
              >
                Sign in
              </Link>
            }
          />
        </div>

        <motion.section
          initial={animateMotion ? { opacity: 0, y: 18 } : false}
          animate={animateMotion ? { opacity: 1, y: 0 } : undefined}
          transition={animateMotion ? { duration: 0.45, ease: "easeOut" } : undefined}
          className="mx-auto w-full max-w-7xl flex-1"
        >
          <div className="mb-6 text-center sm:mb-8">
            <p className="text-[11px] uppercase tracking-[0.3em] text-cold-cyan/75">
              experience preview
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-text-primary sm:text-3xl">
              로그인 없이 오늘의 광맥을 먼저 체험해보세요
            </h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary sm:text-base">
              아래 3개 광맥 중 하나를 선택하면 샘플 아이디어 3개를 바로 볼 수 있어요.
              <br className="hidden sm:inline" />
              저장, 전체 결과, 상세 탐색은 로그인 후에 가능합니다.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
            {veins.map((vein) => (
              <DemoVeinCard key={vein.id} vein={vein} />
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-xs text-text-secondary/60">
              실제 광맥은 매일 새로 열립니다. 로그인하면 본인의 Mine으로 이동합니다.
            </p>
            <Link href="/auth/sign-in?next=/mine">
              <SignalButton variant="primary" className="px-6">
                본격적으로 채굴 시작하기
              </SignalButton>
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
