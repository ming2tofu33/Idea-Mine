"use client";

import { useQuery } from "@tanstack/react-query";

import { profileApi } from "@/lib/api";

export function useProfile() {
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: profileApi.getProfile,
    staleTime: 5 * 60 * 1000,
  });

  return {
    profile: profileQuery.data ?? null,
    isLoading: profileQuery.isLoading,
  };
}
