/**
 * IDEA MINE — useMining Hook
 * 광맥 조회, 리롤, 채굴 상태 관리.
 * React Query로 today-veins 캐시 + mutation.
 */

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { miningApi, ApiClientError } from "../lib/api";
import { withMinDelay } from "../lib/minDelay";
import type { Vein, DailyState, TodayVeinsResponse } from "../types/api";

const INITIAL_DAILY_STATE: DailyState = {
  rerolls_used: 0,
  rerolls_max: 2,
  generations_used: 0,
  generations_max: 1,
};

interface MiningOptions {
  role: "user" | "admin";
  personaTier: "free" | "lite" | "pro" | null;
}

export function useMining({ role, personaTier }: MiningOptions) {
  const queryClient = useQueryClient();
  const [selectedVeinId, setSelectedVeinId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery<TodayVeinsResponse>({
    queryKey: ["today-veins"],
    queryFn: () => withMinDelay(miningApi.getTodayVeins(), 1500),
    staleTime: 0,
    refetchOnMount: true,
  });

  const veins = data?.veins ?? [];
  const dailyState: DailyState = data
    ? {
        rerolls_used: data.rerolls_used,
        rerolls_max: data.rerolls_max,
        generations_used: data.generations_used,
        generations_max: data.generations_max,
      }
    : INITIAL_DAILY_STATE;

  // veins 로드 후 첫 번째 미선택 광맥 자동 선택
  const effectiveSelectedId =
    selectedVeinId && veins.some((v) => v.id === selectedVeinId)
      ? selectedVeinId
      : veins.find((v) => !v.is_selected)?.id ?? veins[0]?.id ?? null;

  const loadTodayVeins = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["today-veins"] });
  }, [queryClient]);

  const selectVein = (veinId: string) => {
    setSelectedVeinId(veinId);
  };

  const reroll = useCallback(async () => {
    setError(null);
    try {
      const res = await miningApi.reroll();
      // 캐시 직접 업데이트 (네트워크 재요청 없이)
      queryClient.setQueryData<TodayVeinsResponse>(["today-veins"], (old) =>
        old
          ? {
              ...old,
              veins: res.veins,
              rerolls_used: res.rerolls_used,
              rerolls_max: res.rerolls_max,
            }
          : undefined
      );
      setSelectedVeinId(res.veins[0]?.id ?? null);
    } catch (e) {
      const msg = e instanceof ApiClientError ? e.message : "리롤에 실패했습니다";
      setError(msg);
    }
  }, [queryClient]);

  const mine = useCallback(async (veinId: string) => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await miningApi.mine(veinId);
      // 캐시에서 해당 광맥 is_selected 업데이트
      queryClient.setQueryData<TodayVeinsResponse>(["today-veins"], (old) =>
        old
          ? {
              ...old,
              veins: old.veins.map((v) =>
                v.id === veinId ? { ...v, is_selected: true } : v
              ),
              generations_used: old.generations_used + 1,
            }
          : undefined
      );
      setSelectedVeinId(
        veins.find((v) => v.id !== veinId && !v.is_selected)?.id ?? null
      );
      // 금고 데이터도 invalidate (새 아이디어 추가됨)
      queryClient.invalidateQueries({ queryKey: ["vault-ideas"] });
      return res;
    } catch (e) {
      console.error("[mine error]", e instanceof ApiClientError ? `${e.status}: ${e.message}` : e);
      const msg = e instanceof ApiClientError ? e.message : "채굴에 실패했습니다";
      setIsGenerating(false);
      setError(msg);
      return null;
    }
  }, [queryClient, veins]);

  const stopGenerating = useCallback(() => {
    setIsGenerating(false);
  }, []);

  const isUnlimited = role === "admin" && !personaTier;
  const isExhausted = isUnlimited ? false : dailyState.generations_used >= dailyState.generations_max;
  const rerollsLeft = isUnlimited ? 999 : dailyState.rerolls_max - dailyState.rerolls_used;
  const selectedVein = veins.find((v) => v.id === effectiveSelectedId) ?? null;

  return {
    veins,
    dailyState,
    selectedVeinId: effectiveSelectedId,
    selectedVein,
    isLoading,
    isGenerating,
    isExhausted,
    isUnlimited,
    rerollsLeft,
    error,
    loadTodayVeins,
    selectVein,
    reroll,
    mine,
    stopGenerating,
  };
}
