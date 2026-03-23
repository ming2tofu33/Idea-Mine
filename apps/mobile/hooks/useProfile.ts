/**
 * IDEA MINE — useProfile Hook
 * Supabase에서 직접 유저 프로필을 읽어옵니다.
 * (읽기 전용 프로필 데이터, 비즈니스 로직 불필요)
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { adminApi, isMockMode } from "../lib/api";
import { MOCK_PROFILE } from "../lib/mock-data";
import type { UserProfile } from "../types/api";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (isMockMode()) {
      setProfile({ ...MOCK_PROFILE });
      setLoading(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, nickname, language, tier, miner_level, streak_days, role, persona_tier")
      .eq("id", session.user.id)
      .single();

    if (data && !error) {
      setProfile(data as UserProfile);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateNickname = async (nickname: string) => {
    if (!profile) return;
    const { error } = await supabase
      .from("profiles")
      .update({ nickname })
      .eq("id", profile.id);
    if (!error) {
      setProfile({ ...profile, nickname });
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
      setProfile({ ...profile, language });
    }
    return error;
  };

  const setPersona = async (personaTier: "free" | "lite" | "pro" | null) => {
    if (!profile || profile.role !== "admin") return;
    try {
      await adminApi.setPersona(personaTier);
      setProfile({ ...profile, persona_tier: personaTier });
    } catch (e) {
      console.error("Failed to set persona:", e);
    }
  };

  return { profile, loading, refetch: fetchProfile, updateNickname, updateLanguage, setPersona };
}
