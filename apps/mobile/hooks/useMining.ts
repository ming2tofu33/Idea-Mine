/**
 * IDEA MINE — useMining Hook
 * 광맥 조회, 리롤, 채굴 상태 관리
 */

import { useState, useCallback } from "react";
import { miningApi, ApiClientError } from "../lib/api";
import type { Vein, DailyState } from "../types/api";

interface MiningState {
  veins: Vein[];
  dailyState: DailyState;
  selectedVeinId: string | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
}

const INITIAL_DAILY_STATE: DailyState = {
  rerolls_used: 0,
  rerolls_max: 2,
  generations_used: 0,
  generations_max: 1,
};

export function useMining(role: "user" | "admin" = "user") {
  const [state, setState] = useState<MiningState>({
    veins: [],
    dailyState: INITIAL_DAILY_STATE,
    selectedVeinId: null,
    isLoading: true,
    isGenerating: false,
    error: null,
  });

  const loadTodayVeins = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const res = await miningApi.getTodayVeins();
      setState((s) => ({
        ...s,
        veins: res.veins,
        dailyState: {
          rerolls_used: res.rerolls_used,
          rerolls_max: res.rerolls_max,
          generations_used: res.generations_used,
          generations_max: res.generations_max,
        },
        isLoading: false,
        selectedVeinId: res.veins[0]?.id ?? null,
      }));
    } catch (e) {
      const msg = e instanceof ApiClientError ? e.message : "광맥을 불러오지 못했습니다";
      setState((s) => ({ ...s, isLoading: false, error: msg }));
    }
  }, []);

  const selectVein = (veinId: string) => {
    setState((s) => ({ ...s, selectedVeinId: veinId }));
  };

  const reroll = useCallback(async () => {
    setState((s) => ({ ...s, error: null }));
    try {
      const res = await miningApi.reroll();
      setState((s) => ({
        ...s,
        veins: res.veins,
        dailyState: {
          ...s.dailyState,
          rerolls_used: res.rerolls_used,
          rerolls_max: res.rerolls_max,
        },
        selectedVeinId: res.veins[0]?.id ?? null,
      }));
    } catch (e) {
      const msg = e instanceof ApiClientError ? e.message : "리롤에 실패했습니다";
      setState((s) => ({ ...s, error: msg }));
    }
  }, []);

  const mine = useCallback(async (veinId: string) => {
    setState((s) => ({ ...s, isGenerating: true, error: null }));
    try {
      const res = await miningApi.mine(veinId);
      setState((s) => ({
        ...s,
        isGenerating: false,
        dailyState: {
          ...s.dailyState,
          generations_used: s.dailyState.generations_used + 1,
        },
      }));
      return res;
    } catch (e) {
      const msg = e instanceof ApiClientError ? e.message : "채굴에 실패했습니다";
      setState((s) => ({ ...s, isGenerating: false, error: msg }));
      return null;
    }
  }, []);

  const isExhausted = role === "admin" ? false : state.dailyState.generations_used >= state.dailyState.generations_max;
  const rerollsLeft = state.dailyState.rerolls_max - state.dailyState.rerolls_used;
  const selectedVein = state.veins.find((v) => v.id === state.selectedVeinId) ?? null;

  return {
    ...state,
    isExhausted,
    rerollsLeft,
    selectedVein,
    loadTodayVeins,
    selectVein,
    reroll,
    mine,
  };
}
