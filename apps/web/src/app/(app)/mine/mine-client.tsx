"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { MineBackground } from "@/components/backgrounds/mine-background";
import { MineSupportBlock } from "@/components/mine/mine-support-block";
import { MINE_LABELS, type MineLanguage } from "@/components/mine/mine-labels";
import { SectorScanStage } from "@/components/mine/sector-scan-stage";
import { SelectedVeinPanel } from "@/components/mine/selected-vein-panel";
import { PageHeader } from "@/components/shared/page-header";
import { useProfile } from "@/hooks/use-profile";
import { miningApi } from "@/lib/api";
import type { TodayVeinsResponse } from "@/types/api";

export function MineClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useProfile();
  const lang: MineLanguage = (profile?.language ?? "ko") as MineLanguage;
  const [selectedVeinIdState, setSelectedVeinIdState] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["todayVeins"],
    queryFn: miningApi.getTodayVeins,
  });

  const rerollMutation = useMutation({
    mutationFn: miningApi.reroll,
    onSuccess: (response) => {
      queryClient.setQueryData<TodayVeinsResponse>(["todayVeins"], (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          veins: response.veins,
          rerolls_used: response.rerolls_used,
          rerolls_max: response.rerolls_max,
        };
      });

      setSelectedVeinIdState(response.veins[0]?.id ?? null);
      queryClient.invalidateQueries({ queryKey: ["todayVeins"] });
    },
  });

  const canReroll = data != null && data.rerolls_used < data.rerolls_max;
  const canMine = data != null && data.generations_used < data.generations_max;
  const hasUsableVeins = (data?.veins.length ?? 0) > 0;
  const isFatalScanError = isError && !hasUsableVeins;
  const scanErrorMessage = error instanceof Error ? error.message : undefined;
  const scanWarningMessage = isError && hasUsableVeins ? scanErrorMessage : undefined;
  const selectedVeinId =
    selectedVeinIdState != null &&
    data?.veins.some((vein) => vein.id === selectedVeinIdState)
      ? selectedVeinIdState
      : data?.veins[0]?.id ?? null;
  const selectedVein =
    data?.veins.find((vein) => vein.id === selectedVeinId) ?? data?.veins[0] ?? null;
  const supportStatus = isLoading
    ? "loading"
    : isFatalScanError
      ? "error"
      : hasUsableVeins
        ? "ready"
        : "empty";

  function handleMine(veinId: string) {
    router.push(`/mine/${veinId}`);
  }

  return (
    <div className="relative flex min-h-0 flex-1">
      <MineBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto mb-6 w-full max-w-7xl">
          <PageHeader
            eyebrow="MINE"
            title={lang === "ko" ? "오늘의 광맥" : "Today's veins"}
            subtitle={
              lang === "ko"
                ? "탐지된 광맥 중 하나를 선택해 채굴하세요"
                : "Select one of the detected veins to start mining"
            }
            meta={
              data && !isError ? (
                <>
                  <span className="rounded-md border border-line-steel/40 bg-surface-1/50 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-text-secondary">
                    {MINE_LABELS.rerolls[lang]}{" "}
                    <span className="text-text-primary">
                      {data.rerolls_used}/{data.rerolls_max}
                    </span>
                  </span>
                  <span className="rounded-md border border-line-steel/40 bg-surface-1/50 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-text-secondary">
                    {MINE_LABELS.generations[lang]}{" "}
                    <span className="text-text-primary">
                      {data.generations_used}/{data.generations_max}
                    </span>
                  </span>
                </>
              ) : undefined
            }
          />
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,380px)] lg:items-stretch">
          <SectorScanStage
            veins={data?.veins ?? []}
            selectedVeinId={selectedVeinId}
            onSelect={(veinId) => setSelectedVeinIdState(veinId)}
            isLoading={isLoading}
            isError={isFatalScanError}
            errorMessage={scanErrorMessage}
            warningMessage={scanWarningMessage}
            lang={lang}
          />

          <SelectedVeinPanel
            vein={selectedVein}
            canMine={canMine}
            canReroll={canReroll}
            isRerolling={rerollMutation.isPending}
            isRefetching={isFetching}
            isLoading={isLoading}
            isError={isFatalScanError}
            errorMessage={scanErrorMessage}
            warningMessage={scanWarningMessage}
            onMine={handleMine}
            onRetry={refetch}
            onReroll={() => rerollMutation.mutate()}
            lang={lang}
          />
        </div>

        <MineSupportBlock status={supportStatus} lang={lang} />
      </div>
    </div>
  );
}
