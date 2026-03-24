/**
 * IDEA MINE — useProfile Hook
 * Supabase에서 직접 유저 프로필을 읽어옵니다.
 * React Query로 5분간 캐시, 전역 공유.
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { adminApi, isMockMode } from "../lib/api";
import { MOCK_PROFILE } from "../lib/mock-data";
import type { UserProfile } from "../types/api";

async function fetchProfile(): Promise<UserProfile | null> {
  if (isMockMode()) {
    return { ...MOCK_PROFILE };
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, nickname, language, tier, miner_level, streak_days, role, persona_tier")
    .eq("id", session.user.id)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

export function useProfile() {
  const queryClient = useQueryClient();

  const { data: profile = null, isLoading: loading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000, // 5분
  });

  const refetch = () => queryClient.invalidateQueries({ queryKey: ["profile"] });

  const updateNickname = async (nickname: string) => {
    if (!profile) return;
    const { error } = await supabase
      .from("profiles")
      .update({ nickname })
      .eq("id", profile.id);
    if (!error) {
      queryClient.setQueryData<UserProfile | null>(["profile"], (old) =>
        old ? { ...old, nickname } : old
      );
    }
    return error;
  };

  const updateLanguage = async (language: "ko" | "en") => {
    if (!profile) return;
    const { error } = await supabase
      .from("profiles")
      .update({ language })
      .eq("id", profile.id);
    if (!error) {
      queryClient.setQueryData<UserProfile | null>(["profile"], (old) =>
        old ? { ...old, language } : old
      );
    }
    return error;
  };

  const setPersona = async (personaTier: "free" | "lite" | "pro" | null) => {
    if (!profile || profile.role !== "admin") return;
    try {
      await adminApi.setPersona(personaTier);
      queryClient.setQueryData<UserProfile | null>(["profile"], (old) =>
        old ? { ...old, persona_tier: personaTier } : old
      );
    } catch (e) {
      console.error("Failed to set persona:", e);
    }
  };

  return { profile, loading, refetch, updateNickname, updateLanguage, setPersona };
}
