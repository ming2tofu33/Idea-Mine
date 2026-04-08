"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { MineBackground } from "@/components/backgrounds/mine-background";
import { SectorScanStage } from "@/components/mine/sector-scan-stage";
import { SelectedVeinPanel } from "@/components/mine/selected-vein-panel";
import { StatusRail } from "@/components/shared/status-rail";
import { miningApi } from "@/lib/api";
import type { TodayVeinsResponse } from "@/types/api";

export default function MinePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedVeinIdState, setSelectedVeinIdState] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
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
  const selectedVeinId =
    selectedVeinIdState != null &&
    data?.veins.some((vein) => vein.id === selectedVeinIdState)
      ? selectedVeinIdState
      : data?.veins[0]?.id ?? null;
  const selectedVein =
    data?.veins.find((vein) => vein.id === selectedVeinId) ?? data?.veins[0] ?? null;

  function handleMine(veinId: string) {
    router.push(`/mine/${veinId}`);
  }

  return (
    <div className="relative flex min-h-0 flex-1">
      <MineBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto mb-4 w-full max-w-7xl">
          <StatusRail
            variant="app"
            left={
              <span className="text-xs uppercase tracking-[0.28em] text-text-secondary/75">
                rerolls{" "}
                <span className="text-text-primary">
                  {data?.rerolls_used ?? "--"}/{data?.rerolls_max ?? "--"}
                </span>
              </span>
            }
            center={
              <span className="hidden text-[11px] uppercase tracking-[0.24em] text-cold-cyan/75 lg:inline">
                {selectedVein?.keywords[0]?.ko ?? "sector scan active"}
              </span>
            }
            right={
              <span className="text-xs uppercase tracking-[0.28em] text-text-secondary/75">
                generations{" "}
                <span className="text-text-primary">
                  {data?.generations_used ?? "--"}/{data?.generations_max ?? "--"}
                </span>
              </span>
            }
          />
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,380px)] lg:items-stretch">
          <SectorScanStage
            veins={data?.veins ?? []}
            selectedVeinId={selectedVeinId}
            onSelect={(veinId) => setSelectedVeinIdState(veinId)}
            isLoading={isLoading}
            isError={isError}
            errorMessage={error instanceof Error ? error.message : undefined}
          />

          <SelectedVeinPanel
            vein={selectedVein}
            canMine={canMine}
            canReroll={canReroll}
            isRerolling={rerollMutation.isPending}
            isLoading={isLoading}
            isError={isError}
            errorMessage={error instanceof Error ? error.message : undefined}
            onMine={handleMine}
            onReroll={() => rerollMutation.mutate()}
          />
        </div>
      </div>
    </div>
  );
}
