"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { MineBackground } from "@/components/backgrounds/mine-background";
import { VeinCard } from "@/components/mine/vein-card";
import { miningApi } from "@/lib/api";

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-line-steel/20 bg-surface-1/40 p-5">
      <div className="mb-4 h-4 w-20 rounded bg-surface-2/60" />
      <div className="mb-5 flex flex-wrap gap-2">
        <div className="h-5 w-12 rounded-full bg-surface-2/60" />
        <div className="h-5 w-16 rounded-full bg-surface-2/60" />
        <div className="h-5 w-14 rounded-full bg-surface-2/60" />
        <div className="h-5 w-10 rounded-full bg-surface-2/60" />
        <div className="h-5 w-16 rounded-full bg-surface-2/60" />
      </div>
      <div className="h-10 w-full rounded-lg bg-surface-2/40" />
    </div>
  );
}

export default function MinePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todayVeins"] });
    },
  });

  const canReroll =
    data != null && data.rerolls_used < data.rerolls_max;
  const canMine =
    data != null && data.generations_used < data.generations_max;

  function handleMine(veinId: string) {
    router.push(`/mine/${veinId}`);
  }

  return (
    <div className="relative flex min-h-0 flex-1">
      <MineBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Status bar */}
        <div className="mx-auto mb-6 flex w-full max-w-4xl items-center justify-between">
          <span className="text-sm text-text-secondary">
            리롤{" "}
            <span className="text-text-primary">
              {data?.rerolls_used ?? "–"}/{data?.rerolls_max ?? "–"}
            </span>
          </span>
          <span className="text-sm text-text-secondary">
            채굴{" "}
            <span className="text-text-primary">
              {data?.generations_used ?? "–"}/{data?.generations_max ?? "–"}
            </span>
          </span>
        </div>

        {/* Vein cards */}
        <div className="mx-auto w-full max-w-4xl flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-text-secondary">
                광맥을 불러오지 못했습니다
              </p>
              <p className="mt-1 text-xs text-text-secondary/60">
                {error instanceof Error ? error.message : "알 수 없는 오류"}
              </p>
            </div>
          ) : data ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {data.veins.map((vein) => (
                <VeinCard
                  key={vein.id}
                  vein={vein}
                  onMine={handleMine}
                  canMine={canMine}
                  isMining={false}
                />
              ))}
            </div>
          ) : null}
        </div>

        {/* Reroll button */}
        <div className="mx-auto mt-6 w-full max-w-4xl text-center">
          <button
            type="button"
            disabled={!canReroll || rerollMutation.isPending}
            onClick={() => rerollMutation.mutate()}
            className={[
              "rounded-lg border px-5 py-2.5 text-sm font-medium transition-all duration-200",
              !canReroll || rerollMutation.isPending
                ? "cursor-not-allowed border-line-steel/30 bg-surface-2/40 text-text-secondary opacity-40"
                : "border-line-steel bg-surface-2 text-text-secondary hover:border-signal-pink/30 hover:text-text-primary",
            ].join(" ")}
          >
            {rerollMutation.isPending ? "새 광맥 탐색 중..." : "다시 파기 🔄"}
          </button>
        </div>
      </div>
    </div>
  );
}
