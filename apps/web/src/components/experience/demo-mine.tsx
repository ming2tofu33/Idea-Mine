"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MineBackground } from "@/components/backgrounds/mine-background";
import { MineSupportBlock } from "@/components/mine/mine-support-block";
import { SectorScanStage } from "@/components/mine/sector-scan-stage";
import { SelectedVeinPanel } from "@/components/mine/selected-vein-panel";
import { PageHeader } from "@/components/shared/page-header";
import { getDemoTodayVeinsResponse } from "@/lib/experience-data";
import { trackExperienceEvent } from "@/lib/experience-events";

/**
 * DemoMine — 게스트가 /mine을 방문했을 때 보여주는 데모 모드.
 *
 * 실제 Mine 페이지의 핵심 컴포넌트(SectorScanStage, SelectedVeinPanel)를
 * 그대로 재사용하되, 데이터만 정적 데모 데이터를 주입한다.
 *
 * 주요 액션(MINE TARGET, RESCAN SECTORS)은 모두 sign-in으로 유도하는
 * soft gate로 연결된다.
 */
export function DemoMine() {
  const data = useMemo(() => getDemoTodayVeinsResponse(), []);
  const [selectedVeinIdState, setSelectedVeinIdState] = useState<string | null>(
    data.veins[0]?.id ?? null,
  );

  useEffect(() => {
    trackExperienceEvent({
      eventName: "experience_entry_view",
      route: "/mine",
      metadata: { mode: "demo" },
    });
  }, []);

  const selectedVein =
    data.veins.find((v) => v.id === selectedVeinIdState) ?? data.veins[0] ?? null;

  function handleSelect(veinId: string) {
    setSelectedVeinIdState(veinId);
    trackExperienceEvent({
      eventName: "experience_vein_select",
      route: "/mine",
      veinId,
    });
  }

  function handleMineGate(veinId: string) {
    trackExperienceEvent({
      eventName: "experience_gate_click",
      route: "/mine",
      veinId,
      metadata: { gate: "mine_target" },
    });
    window.location.href = `/auth/sign-in?next=${encodeURIComponent(`/mine/${veinId}`)}`;
  }

  function handleRerollGate() {
    trackExperienceEvent({
      eventName: "experience_gate_click",
      route: "/mine",
      metadata: { gate: "reroll" },
    });
    window.location.href = "/auth/sign-in?next=/mine";
  }

  return (
    <div className="relative flex min-h-0 flex-1">
      <MineBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Header — 실제 Mine과 동일한 PageHeader 사용 */}
        <div className="mx-auto mb-6 w-full max-w-7xl">
          <PageHeader
            eyebrow="MINE"
            title="오늘의 광맥"
            subtitle="탐지된 광맥 중 하나를 선택해 채굴하세요"
          />
        </div>

        {/* 핵심 인터랙션 — 실제 Mine과 100% 동일한 컴포넌트 */}
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,380px)] lg:items-stretch">
          <SectorScanStage
            veins={data.veins}
            selectedVeinId={selectedVein?.id ?? null}
            onSelect={handleSelect}
            isLoading={false}
            isError={false}
          />

          <SelectedVeinPanel
            vein={selectedVein}
            canMine={true}
            canReroll={true}
            isRerolling={false}
            isRefetching={false}
            isLoading={false}
            isError={false}
            onMine={handleMineGate}
            onRetry={() => {}}
            onReroll={handleRerollGate}
          />
        </div>

        {/* 데모 컨텍스트 안내 — 한 줄, 작게 */}
        <div className="mx-auto mt-6 w-full max-w-7xl">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-cold-cyan/15 bg-[rgba(92,205,229,0.04)] px-5 py-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-xs leading-5 text-text-secondary sm:text-sm">
              <span className="font-semibold text-cold-cyan">이 광맥은 샘플입니다</span>
              <span className="mx-2 text-text-secondary/40">·</span>
              진짜 광맥은 로그인 후 매일 새로 열립니다
            </p>
            <Link
              href="/auth/sign-in?next=/mine"
              className="shrink-0 rounded-lg border border-cold-cyan/40 bg-cold-cyan/15 px-4 py-2 text-xs font-medium text-cold-cyan transition-all hover:bg-cold-cyan/25"
            >
              내 광맥 보러 가기 →
            </Link>
          </div>
        </div>

        <MineSupportBlock status="ready" />
      </div>
    </div>
  );
}
