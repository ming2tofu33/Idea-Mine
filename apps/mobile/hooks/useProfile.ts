/**
 * IDEA MINE — useProfile Hook
 * Supabase에서 직접 유저 프로필을 읽어옵니다.
 * (읽기 전용 프로필 데이터, 비즈니스 로직 불필요)
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { UserProfile } from "../types/api";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, nickname, language, tier, miner_level, consecutive_days, role")
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

  return { profile, loading, refetch: fetchProfile, updateNickname };
}
